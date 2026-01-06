# VisionCRM - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Web App (Next.js 15 + React)                                   │
│  - Server Components (data fetching)                            │
│  - Client Components (interactivity)                            │
│  - Shadcn UI (design system)                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    EDGE LAYER (Vercel)                          │
├─────────────────────────────────────────────────────────────────┤
│  - CDN (static assets)                                          │
│  - Edge Functions (middleware)                                  │
│  - DDoS Protection (Cloudflare)                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (Serverless Functions)                      │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │ /api/auth    │ /api/contacts│ /api/ai      │                │
│  │ /api/quotes  │ /api/invoices│ /api/webhooks│                │
│  └──────────────┴──────────────┴──────────────┘                │
│                                                                  │
│  Business Logic Layer                                           │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │ Tenant       │ RBAC         │ Validation   │                │
│  │ Isolation    │ Middleware   │ (Zod)        │                │
│  └──────────────┴──────────────┴──────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  Prisma ORM                                                     │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │ PostgreSQL   │ Redis        │ File Storage │                │
│  │ (Supabase)   │ (Upstash)    │ (Vercel Blob)│                │
│  └──────────────┴──────────────┴──────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┬────────────┬────────────┬────────────┐         │
│  │ Gemini AI  │ Stripe     │ Twilio     │ Resend     │         │
│  │ (Google)   │ (Payment)  │ (WhatsApp) │ (Email)    │         │
│  └────────────┴────────────┴────────────┴────────────┘         │
│  ┌────────────┬────────────┐                                    │
│  │ Cloud      │ Sentry     │                                    │
│  │ Vision OCR │ (Errors)   │                                    │
│  └────────────┴────────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Multi-Tenant Architecture

### Isolation Strategy: Shared Database with RLS

**Tenant Identification:**
```
Request → Middleware → Extract subdomain → Set tenant context → API Handler
```

**Example Flow:**
```
1. User visits: https://garage-dupont.visioncrm.app/contacts
2. Middleware extracts: subdomain = "garage-dupont"
3. Database lookup: SELECT id FROM tenants WHERE subdomain = 'garage-dupont'
4. Set context: tenant_id = "uuid-xxx"
5. All queries auto-filtered: WHERE tenant_id = 'uuid-xxx'
```

### Subdomain Routing

**DNS Configuration:**
```dns
*.visioncrm.app    CNAME    cname.vercel-dns.com
```

**Vercel Configuration:**
```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<tenant>.*).visioncrm.app'
          }
        ]
      }
    ];
  }
};
```

**Middleware:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Skip for main domain
  if (subdomain === 'www' || subdomain === 'visioncrm') {
    return NextResponse.next();
  }
  
  // Set tenant context in headers
  const response = NextResponse.next();
  response.headers.set('x-tenant-subdomain', subdomain);
  return response;
}
```

### Database Isolation (Row-Level Security)

**PostgreSQL RLS Policies:**
```sql
-- Enable RLS on all tenant tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Only access your tenant's data
CREATE POLICY tenant_isolation_contacts ON contacts
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Apply similar policies to all tables
```

**Prisma Middleware (Application-Level):**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tenant isolation middleware
prisma.$use(async (params, next) => {
  const tenantId = await getCurrentTenantId(); // From session
  
  const tenantModels = ['Contact', 'Vehicle', 'Quote', 'Invoice', 'Task'];
  
  if (params.model && tenantModels.includes(params.model)) {
    // Automatically inject tenant_id
    if (params.action === 'create') {
      params.args.data = { ...params.args.data, tenant_id: tenantId };
    }
    
    // Auto-filter by tenant_id
    if (['findMany', 'findFirst', 'update', 'delete'].includes(params.action)) {
      params.args.where = { ...params.args.where, tenant_id: tenantId };
    }
  }
  
  return next(params);
});
```

## Authentication & Authorization

### NextAuth.js Configuration

**Auth Flow:**
```
1. User submits email/password
2. Credentials provider validates against database
3. Session created with tenant_id embedded
4. JWT token signed with secret
5. Client receives session cookie (httpOnly, secure)
```

**Implementation:**
```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true }
        });
        
        if (!user || !user.password) return null;
        
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenant_id,
          role: user.role
        };
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId;
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      session.user.tenantId = token.tenantId;
      session.user.role = token.role;
      return session;
    }
  }
};
```

### Role-Based Access Control (RBAC)

**Roles Hierarchy:**
```
SUPER_ADMIN (platform admin)
  └── OWNER (tenant admin)
      └── MANAGER (read/write, no billing)
          └── USER (read-only + assigned tasks)
```

**Permission Matrix:**

| Action | SUPER_ADMIN | OWNER | MANAGER | USER |
|--------|-------------|-------|---------|------|
| View contacts | ✅ | ✅ | ✅ | ✅ |
| Create contacts | ✅ | ✅ | ✅ | ❌ |
| Delete contacts | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ✅ | ❌ | ❌ |
| Billing | ✅ | ✅ | ❌ | ❌ |
| View all tenants | ✅ | ❌ | ❌ | ❌ |

**Implementation:**
```typescript
// lib/rbac.ts
import { Role } from '@prisma/client';

const permissions = {
  'contacts:create': ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
  'contacts:update': ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
  'contacts:delete': ['OWNER', 'SUPER_ADMIN'],
  'users:manage': ['OWNER', 'SUPER_ADMIN'],
  'billing:manage': ['OWNER', 'SUPER_ADMIN']
};

export function hasPermission(role: Role, action: string): boolean {
  return permissions[action]?.includes(role) || false;
}

// Middleware example
export function requirePermission(action: string) {
  return async (req: Request) => {
    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');
    
    if (!hasPermission(session.user.role, action)) {
      throw new Error('Forbidden');
    }
  };
}
```

## AI Integration Architecture

### Gemini Multi-Agent System

**Agent Types:**

1. **Conversational Assistant** (gemini-2.0-flash)
   - Purpose: User support, navigation, quick answers
   - Context: CRM knowledge base
   - Response time: <3s

2. **Data Analyst** (gemini-2.0-flash-thinking)
   - Purpose: Pipeline analysis, forecasting, insights
   - Context: Historical CRM data
   - Response time: <10s

3. **Content Generator** (gemini-2.0-flash)
   - Purpose: Emails, SMS, marketing content
   - Context: Customer data, templates
   - Response time: <5s

**Implementation:**
```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const agents = {
  assistant: genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `You are VisionCRM assistant for French garages.
      - Help users navigate CRM
      - Answer questions about features
      - Execute simple actions
      - Always respond in French
      - Be concise (max 200 words)`,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
      topP: 0.9
    }
  }),
  
  analyst: genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-thinking',
    systemInstruction: `Analyze CRM data and provide insights.
      Output JSON only: { insights: [], recommendations: [] }`,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2000,
      responseMimeType: 'application/json'
    }
  }),
  
  writer: genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `Generate professional French business content.
      - Emails: friendly but professional
      - SMS: concise (max 160 chars)
      - Max 200 words per email`,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 800
    }
  })
};
```

### Context Caching (Cost Optimization)

**Strategy:**
```typescript
// Cache system instructions for 1 hour
const cachedInstruction = await genAI.cacheSystemInstruction({
  model: 'gemini-2.0-flash',
  systemInstruction: largeSystemPrompt, // >10K tokens
  ttl: 3600 // 1 hour
});

// Use cached instruction
const response = await genAI.generateContent({
  model: 'gemini-2.0-flash',
  cachedContent: cachedInstruction.name,
  prompt: userQuery
});
```

**Cost Savings:**
- Cached tokens: $0.01875/1M (75% cheaper than input)
- Uncached input: $0.075/1M
- Example: 20K token system prompt used 100 times/hour
  - Without cache: 20K × 100 × $0.075 / 1M = $0.15
  - With cache: 20K × 1 × $0.075 / 1M + 20K × 99 × $0.01875 / 1M = $0.04
  - Savings: 73%

### Rate Limiting

**Implementation:**
```typescript
// lib/ai-rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const LIMITS = {
  FREE: 10,          // 10 queries/month
  STARTER: 100,      // 100 queries/month
  PRO: 1000,         // 1000 queries/month
  ENTERPRISE: Infinity
};

export async function checkAIQuota(tenantId: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true }
  });
  
  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const key = `ai:quota:${tenantId}:${monthKey}`;
  
  const usage = await redis.get<number>(key) || 0;
  return usage < LIMITS[tenant!.plan];
}

export async function incrementAIQuota(tenantId: string) {
  const monthKey = new Date().toISOString().slice(0, 7);
  const key = `ai:quota:${tenantId}:${monthKey}`;
  
  const usage = await redis.incr(key);
  
  // Set expiry on first increment
  if (usage === 1) {
    await redis.expire(key, 30 * 24 * 60 * 60); // 30 days
  }
  
  return usage;
}
```

## Database Architecture

### Connection Pooling

**PgBouncer Configuration (Supabase):**
```typescript
// Database URL with pooler
// postgresql://postgres:password@db.project.supabase.co:6543/postgres?pgbouncer=true

// Prisma schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Connection pool settings
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['query', 'error', 'warn']
});
```

**Pool Limits:**
- Max connections: 20 (Vercel serverless)
- Idle timeout: 10s
- Connection timeout: 30s

### Indexing Strategy

**Critical Indexes:**
```sql
-- Contacts: Fast lookups
CREATE INDEX idx_contacts_tenant_email ON contacts(tenant_id, email);
CREATE INDEX idx_contacts_tenant_phone ON contacts(tenant_id, phone);
CREATE INDEX idx_contacts_tenant_created ON contacts(tenant_id, created_at DESC);

-- Invoices: Overdue checks
CREATE INDEX idx_invoices_overdue ON invoices(tenant_id, due_date)
  WHERE status != 'PAID';

-- Tasks: Kanban view
CREATE INDEX idx_tasks_kanban ON tasks(tenant_id, status, created_at DESC);

-- Activities: Timeline
CREATE INDEX idx_activities_timeline ON activities(tenant_id, created_at DESC);

-- Full-text search on contacts
CREATE INDEX idx_contacts_search ON contacts USING GIN(
  to_tsvector('french', first_name || ' ' || last_name || ' ' || COALESCE(email, ''))
);
```

### Data Retention & Archival

**Soft Delete Pattern:**
```typescript
// All models have deleted_at field
model Contact {
  // ...
  deleted_at DateTime? @db.Timestamptz(3)
}

// Soft delete function
export async function softDelete(model: string, id: string) {
  await prisma[model].update({
    where: { id },
    data: { deleted_at: new Date() }
  });
}

// Hard delete after 30 days (cron job)
export async function hardDeleteOld() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  
  await prisma.contact.deleteMany({
    where: {
      deleted_at: { lt: cutoff }
    }
  });
}
```

## Caching Strategy

### Redis Usage

**Cache Patterns:**

1. **Session Storage** (TTL: 7 days)
2. **AI Quota Tracking** (TTL: 30 days)
3. **Dashboard Data** (TTL: 5 minutes)
4. **API Rate Limiting** (TTL: 1 hour)

**Implementation:**
```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached) return cached;
  
  // Fetch fresh data
  const fresh = await fetcher();
  
  // Store in cache
  await redis.setex(key, ttl, fresh);
  
  return fresh;
}

// Usage example
const dashboardData = await getCached(
  `dashboard:${tenantId}`,
  async () => {
    const revenue = await calculateRevenue(tenantId);
    const pipeline = await getPipelineMetrics(tenantId);
    return { revenue, pipeline };
  },
  300 // 5 minutes
);
```

## Security Architecture

### Data Encryption

**At Rest:**
- PostgreSQL: Native encryption (Supabase default)
- Backups: AES-256 encryption
- PII fields: Field-level encryption with `pgcrypto`

**In Transit:**
- All traffic: TLS 1.3
- API calls: HTTPS only
- Database: SSL mode required

**Field-Level Encryption Example:**
```sql
-- Enable pgcrypto extension
CREATE EXTENSION pgcrypto;

-- Encrypt sensitive fields
UPDATE contacts
SET email_encrypted = pgp_sym_encrypt(email, 'encryption_key');

-- Decrypt on read
SELECT pgp_sym_decrypt(email_encrypted, 'encryption_key') AS email
FROM contacts;
```

### API Security

**Rate Limiting:**
```typescript
// middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
  analytics: true
});

export async function rateLimitMiddleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    });
  }
}
```

**CORS Configuration:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://*.visioncrm.app'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ];
  }
};
```

## Performance Optimization

### Server Components Strategy

**Data Fetching:**
```typescript
// app/(dashboard)/contacts/page.tsx
// Server Component - fetch data on server
export default async function ContactsPage() {
  const tenantId = await getCurrentTenantId();
  
  // Direct database access (no API call)
  const contacts = await prisma.contact.findMany({
    where: { tenant_id: tenantId },
    orderBy: { created_at: 'desc' },
    take: 20
  });
  
  return <ContactsTable initialData={contacts} />;
}

// components/contacts/contacts-table.tsx
// Client Component - interactivity
'use client';
export function ContactsTable({ initialData }) {
  const [data, setData] = useState(initialData);
  const [filter, setFilter] = useState('');
  
  // Client-side filtering (instant)
  const filtered = data.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div>
      <input onChange={e => setFilter(e.target.value)} />
      <Table data={filtered} />
    </div>
  );
}
```

### Database Query Optimization

**N+1 Query Prevention:**
```typescript
// BAD: N+1 queries
const contacts = await prisma.contact.findMany();
for (const contact of contacts) {
  const vehicles = await prisma.vehicle.findMany({
    where: { owner_id: contact.id }
  });
}

// GOOD: Single query with include
const contacts = await prisma.contact.findMany({
  include: {
    vehicles: true,
    quotes: {
      where: { status: 'SENT' },
      orderBy: { created_at: 'desc' },
      take: 5
    }
  }
});
```

**Pagination:**
```typescript
// Cursor-based pagination (efficient for large datasets)
export async function getContacts(
  tenantId: string,
  cursor?: string,
  limit = 20
) {
  return await prisma.contact.findMany({
    where: { tenant_id: tenantId },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { created_at: 'desc' }
  });
}
```

## Monitoring & Observability

### Error Tracking (Sentry)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Filter out PII
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  }
});
```

### Logging

```typescript
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['email', 'phone', 'password', 'api_key'],
    remove: true
  }
});

export default logger;

// Usage
logger.info({ tenantId, action: 'contact.created' }, 'Contact created');
logger.error({ error, tenantId }, 'Database connection failed');
```

## Deployment Architecture

### Vercel Edge Network

**Regions:**
- Primary: Paris (EU West)
- Failover: Frankfurt (EU Central)

**Edge Functions:**
- Middleware (tenant routing)
- Auth checks
- Rate limiting

**Serverless Functions:**
- API routes
- Server components
- Background jobs (via cron)

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

**Last Updated:** 2026-01-01  
**Version:** 1.0
