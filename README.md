# VisionCRM

AI-powered multi-tenant CRM platform for French automotive garages and service businesses.

## Quick Start

```bash
# Clone repository
git clone https://github.com/visionprod-labz/visioncrm.git
cd visioncrm

# Install dependencies
pnpm install

# Setup PostgreSQL (Docker)
docker run --name visioncrm-db \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_DB=visioncrm \
  -p 5432:5432 \
  -d postgres:16

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Initialize database
pnpm prisma generate
pnpm prisma migrate dev

# Seed development data
pnpm prisma db seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Shadcn UI |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL 16 + Row-Level Security |
| AI | Gemini 2.0 Flash, Flash-Thinking |
| Auth | NextAuth.js |
| Payments | Stripe |
| Email | Resend |
| WhatsApp | Twilio |
| OCR | Google Cloud Vision |
| Cache | Upstash Redis |
| Hosting | Vercel |
| Monitoring | Sentry, Vercel Analytics |

## Project Structure

```
visioncrm/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login, register)
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── contacts/
│   │   ├── vehicles/
│   │   ├── quotes/
│   │   ├── invoices/
│   │   ├── tasks/
│   │   └── dashboard/
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── contacts/
│   │   ├── vehicles/
│   │   ├── quotes/
│   │   ├── invoices/
│   │   ├── tasks/
│   │   ├── ai/
│   │   └── webhooks/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── contacts/
│   ├── vehicles/
│   ├── quotes/
│   ├── invoices/
│   ├── tasks/
│   ├── dashboard/
│   └── shared/
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth config
│   ├── gemini.ts           # Gemini AI clients
│   ├── stripe.ts           # Stripe client
│   ├── email.ts            # Resend client
│   ├── whatsapp.ts         # Twilio client
│   ├── ocr.ts              # Google Vision client
│   ├── cache.ts            # Redis utilities
│   ├── tenant.ts           # Tenant isolation
│   ├── validations.ts      # Zod schemas
│   └── utils.ts
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/
│   └── seed.ts
├── docs/                    # Documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPEC.md
│   └── SECURITY.md
├── .claude/                 # Claude Code config
│   ├── system-prompt.md
│   └── agents/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Environment Setup

### Required API Keys

**Gemini AI** (free tier available)
```bash
# Get key from: https://ai.google.dev/
GEMINI_API_KEY="AIzaSy..."
```

**Stripe** (test mode)
```bash
# Dashboard: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

**Twilio** (WhatsApp Business API)
```bash
# Console: https://console.twilio.com/
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_NUMBER="+14155238886"
```

**Resend** (email)
```bash
# Dashboard: https://resend.com/api-keys
RESEND_API_KEY="re_..."
```

**Google Cloud Vision** (OCR)
```bash
# Enable Vision API: https://console.cloud.google.com/
GOOGLE_CLOUD_VISION_KEY="..."
```

**Upstash Redis** (cache)
```bash
# Create database: https://console.upstash.com/
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Full `.env.local` Template

```bash
# Database
DATABASE_URL="postgresql://postgres:dev_password@localhost:5432/visioncrm"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# AI
GEMINI_API_KEY="your-gemini-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Twilio
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_NUMBER="+14155238886"

# Resend
RESEND_API_KEY="re_..."

# Google Cloud
GOOGLE_CLOUD_VISION_KEY="..."

# Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Monitoring (optional for dev)
SENTRY_DSN="https://..."
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."
```

## Development Workflow

### Day-by-Day MVP Development (21 Days)

#### Week 1: Foundation (Days 1-7)

**Day 1-2: Project Setup**
```bash
# Initialize project
pnpm create next-app@latest visioncrm --typescript --tailwind --app
cd visioncrm

# Install dependencies
pnpm add @prisma/client prisma
pnpm add next-auth @auth/prisma-adapter
pnpm add @google/generative-ai
pnpm add zod react-hook-form @hookform/resolvers
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add lucide-react class-variance-authority clsx tailwind-merge
pnpm add -D @types/node tsx vitest @playwright/test

# Setup Shadcn UI
pnpx shadcn-ui@latest init

# Add components
pnpx shadcn-ui@latest add button input label card table dialog dropdown-menu
```

**Day 3-4: Authentication & Multi-Tenancy**
```bash
# Setup Prisma
pnpm prisma init

# Create auth tables migration
pnpm prisma migrate dev --name init_auth

# Test auth flow
pnpm dev
# Visit /login, /register
```

**Day 5-7: Contact CRUD + UI**
```bash
# Create contacts migration
pnpm prisma migrate dev --name add_contacts

# Develop pages
# app/(dashboard)/contacts/page.tsx
# app/(dashboard)/contacts/new/page.tsx
# app/(dashboard)/contacts/[id]/page.tsx

# Test CRUD operations
```

#### Week 2: Core Features (Days 8-14)

**Day 8-10: Vehicle Registry + OCR**
```bash
# Install OCR dependencies
pnpm add @google-cloud/vision

# Create vehicles migration
pnpm prisma migrate dev --name add_vehicles

# Build OCR upload component
# Test with sample carte grise images
```

**Day 11-12: Quotes & Invoices**
```bash
# Create quotes/invoices migrations
pnpm prisma migrate dev --name add_quotes_invoices

# Install PDF generation
pnpm add jspdf jspdf-autotable

# Build quote/invoice forms
```

**Day 13-14: AI Assistant Integration**
```bash
# Setup Gemini clients
# lib/gemini.ts

# Create AI API routes
# app/api/ai/assistant/route.ts
# app/api/ai/analyze/route.ts

# Build chat UI component
# Test AI responses
```

#### Week 3: Integration & Polish (Days 15-21)

**Day 15-17: Communication Hub**
```bash
# Install integrations
pnpm add resend twilio

# Setup email templates
# Setup WhatsApp flow

# Test email/WhatsApp sending
```

**Day 18-19: Dashboard & Reporting**
```bash
# Install chart library
pnpm add recharts

# Build dashboard with KPIs
# Create revenue charts

# Test data aggregation
```

**Day 20: Testing & Bug Fixes**
```bash
# Run all tests
pnpm test
pnpm test:e2e

# Fix critical bugs
# Performance optimization
```

**Day 21: Production Deployment**
```bash
# Deploy to Vercel
vercel --prod

# Configure custom domain
# Setup Stripe webhooks
# Test production flow
```

### Daily Commands

**Development:**
```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
```

**Database:**
```bash
pnpm prisma studio    # Visual database editor
pnpm prisma migrate dev --name <name>  # Create migration
pnpm prisma db push   # Push schema without migration
pnpm prisma db seed   # Seed development data
```

**Testing:**
```bash
pnpm test             # Run unit tests
pnpm test:watch       # Watch mode
pnpm test:e2e         # Playwright E2E tests
```

**Code Quality:**
```bash
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm type-check       # TypeScript check
```

## Key Features Implementation

### 1. Multi-Tenant Isolation

**Every API route MUST enforce tenant context:**
```typescript
// lib/tenant.ts
import { getServerSession } from 'next-auth';

export async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    throw new Error('Unauthorized');
  }
  return session.user.tenantId;
}

// app/api/contacts/route.ts
export async function GET() {
  const tenantId = await getCurrentTenantId();
  const contacts = await prisma.contact.findMany({
    where: { tenant_id: tenantId }
  });
  return Response.json(contacts);
}
```

### 2. AI Agent Usage

**Conversational Assistant:**
```typescript
// app/api/ai/assistant/route.ts
import { agents } from '@/lib/gemini';

export async function POST(req: Request) {
  const { message } = await req.json();
  
  const result = await agents.assistant.generateContent(message);
  return Response.json({ reply: result.response.text() });
}
```

**Data Analyst:**
```typescript
// app/api/ai/analyze/route.ts
import { agents } from '@/lib/gemini';

export async function POST(req: Request) {
  const tenantId = await getCurrentTenantId();
  
  // Fetch pipeline data
  const deals = await prisma.quote.findMany({
    where: { tenant_id: tenantId, status: { in: ['SENT', 'ACCEPTED'] } }
  });
  
  const analysis = await agents.analyst.generateContent({
    prompt: 'Analyze pipeline and suggest actions',
    context: { deals }
  });
  
  return Response.json(JSON.parse(analysis.response.text()));
}
```

### 3. OCR Processing

**Upload & Extract:**
```typescript
// app/api/vehicles/ocr/route.ts
import { extractCarteGrise } from '@/lib/ocr';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const data = await extractCarteGrise(buffer);
  
  return Response.json({ success: true, data });
}
```

### 4. Payment Integration

**Stripe Checkout:**
```typescript
// app/api/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId } = await req.json();
  const tenantId = await getCurrentTenantId();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    client_reference_id: tenantId
  });
  
  return Response.json({ url: session.url });
}
```

## Deployment

### Vercel (Recommended)

**1. Install Vercel CLI:**
```bash
pnpm add -g vercel
```

**2. Link project:**
```bash
vercel link
```

**3. Set environment variables:**
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add GEMINI_API_KEY
# ... add all other env vars
```

**4. Deploy:**
```bash
vercel --prod
```

**5. Configure domain:**
- Add custom domain in Vercel dashboard
- Set wildcard subdomain: `*.visioncrm.app` → Vercel

### Database (Supabase)

**1. Create project:** https://supabase.com/dashboard

**2. Get connection string:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

**3. Run migrations:**
```bash
DATABASE_URL="postgresql://..." pnpm prisma migrate deploy
```

### Monitoring

**Sentry:**
```bash
pnpm add @sentry/nextjs
pnpx @sentry/wizard@latest -i nextjs
```

**Vercel Analytics:**
```bash
pnpm add @vercel/analytics
```

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

**Example Test:**
```typescript
// lib/__tests__/tenant.test.ts
import { describe, it, expect } from 'vitest';
import { getCurrentTenantId } from '../tenant';

describe('getCurrentTenantId', () => {
  it('should return tenant ID from session', async () => {
    // Mock session
    const tenantId = await getCurrentTenantId();
    expect(tenantId).toBeTruthy();
  });
});
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# UI mode (interactive)
pnpm playwright test --ui
```

**Example Test:**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

## Troubleshooting

**Database connection fails:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart container
docker restart visioncrm-db

# Check connection
psql postgresql://postgres:dev_password@localhost:5432/visioncrm
```

**Prisma client out of sync:**
```bash
# Regenerate client
pnpm prisma generate

# Reset database (DEV ONLY)
pnpm prisma migrate reset
```

**AI quota exceeded:**
```bash
# Check Redis usage
# Visit Upstash console or run:
redis-cli -u $UPSTASH_REDIS_REST_URL

# Clear quota (dev only)
DEL ai:quota:<tenant-id>:<month>
```

**Build fails:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

Proprietary - VisionProd-Labz © 2026

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@visioncrm.app

---

**Built with ❤️ by VisionProd-Labz**
