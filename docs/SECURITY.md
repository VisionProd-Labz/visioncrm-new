# VisionCRM - Security & RGPD Compliance

## Security Overview

VisionCRM implements defense-in-depth security with multiple layers of protection:

```
┌─────────────────────────────────────────┐
│  Application Layer Security             │
│  - Input validation (Zod)               │
│  - CSRF protection                      │
│  - XSS prevention                       │
│  - SQL injection prevention (Prisma)    │
└─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  Authentication & Authorization         │
│  - NextAuth.js (session management)     │
│  - RBAC (role-based access control)     │
│  - MFA support (TOTP)                   │
└─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  Data Security                          │
│  - Encryption at rest (PostgreSQL)      │
│  - Encryption in transit (TLS 1.3)      │
│  - Field-level encryption (PII)         │
│  - Row-level security (RLS)             │
└─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  Infrastructure Security                │
│  - Vercel Edge Network (DDoS)           │
│  - Cloudflare WAF                       │
│  - Rate limiting (Upstash)              │
└─────────────────────────────────────────┘
```

## Authentication Security

### Password Policy

**Requirements:**
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- No common passwords (checked against list)

**Implementation:**
```typescript
// lib/validations.ts
import { z } from 'zod';

const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character')
  .refine(
    (password) => !commonPasswords.includes(password.toLowerCase()),
    'Password is too common'
  );
```

**Hashing:**
```typescript
// lib/auth.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Cost factor

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### Multi-Factor Authentication (MFA)

**TOTP Implementation:**
```typescript
// lib/mfa.ts
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

export function generateMFASecret(email: string) {
  const totp = new OTPAuth.TOTP({
    issuer: 'VisionCRM',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(generateRandomSecret())
  });
  
  return {
    secret: totp.secret.base32,
    uri: totp.toString()
  };
}

export async function generateQRCode(uri: string): Promise<string> {
  return await QRCode.toDataURL(uri);
}

export function verifyMFAToken(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret)
  });
  
  // Allow 1 period window (30s before/after)
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}
```

### Session Management

**Session Configuration:**
```typescript
// lib/auth.ts
export const sessionConfig = {
  strategy: 'jwt',
  maxAge: 7 * 24 * 60 * 60, // 7 days
  updateAge: 24 * 60 * 60,   // Refresh daily
  
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    encryption: true,
    maxAge: 7 * 24 * 60 * 60
  },
  
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};
```

**Session Invalidation:**
```typescript
// lib/auth.ts
export async function invalidateSession(userId: string) {
  // Delete all sessions for user
  await prisma.session.deleteMany({
    where: { user_id: userId }
  });
  
  // Clear Redis cache
  await redis.del(`session:${userId}`);
}

export async function invalidateAllSessionsExceptCurrent(
  userId: string,
  currentSessionToken: string
) {
  await prisma.session.deleteMany({
    where: {
      user_id: userId,
      session_token: { not: currentSessionToken }
    }
  });
}
```

## Authorization (RBAC)

### Permission System

**Permission Definitions:**
```typescript
// lib/permissions.ts
export const PERMISSIONS = {
  // Contacts
  'contacts:view': ['USER', 'MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'contacts:create': ['MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'contacts:update': ['MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'contacts:delete': ['OWNER', 'SUPER_ADMIN'],
  
  // Vehicles
  'vehicles:view': ['USER', 'MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'vehicles:create': ['MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'vehicles:update': ['MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'vehicles:delete': ['OWNER', 'SUPER_ADMIN'],
  
  // Quotes & Invoices
  'quotes:view': ['USER', 'MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'quotes:create': ['MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'quotes:update': ['MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'quotes:delete': ['OWNER', 'SUPER_ADMIN'],
  'invoices:view': ['USER', 'MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'invoices:create': ['MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'invoices:update': ['MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'invoices:delete': ['OWNER', 'SUPER_ADMIN'],
  
  // Users
  'users:view': ['MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'users:create': ['OWNER', 'SUPER_ADMIN'],
  'users:update': ['OWNER', 'SUPER_ADMIN'],
  'users:delete': ['OWNER', 'SUPER_ADMIN'],
  
  // Billing
  'billing:view': ['OWNER', 'SUPER_ADMIN'],
  'billing:manage': ['OWNER', 'SUPER_ADMIN'],
  
  // AI
  'ai:use': ['USER', 'MANAGER', 'OWNER', 'SUPER_ADMIN'],
  'ai:unlimited': ['SUPER_ADMIN'],
  
  // Platform Admin
  'platform:manage': ['SUPER_ADMIN']
};

export function hasPermission(role: Role, permission: string): boolean {
  return PERMISSIONS[permission]?.includes(role) || false;
}
```

**Middleware Enforcement:**
```typescript
// middleware/require-permission.ts
import { getServerSession } from 'next-auth';
import { hasPermission } from '@/lib/permissions';

export function requirePermission(permission: string) {
  return async function middleware(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new Error('Unauthorized: No session');
    }
    
    if (!hasPermission(session.user.role, permission)) {
      throw new Error(`Forbidden: Missing permission ${permission}`);
    }
    
    return session;
  };
}

// Usage in API route
export async function DELETE(req: Request) {
  await requirePermission('contacts:delete')(req);
  // Proceed with deletion...
}
```

## Input Validation

### Zod Schemas

**Contact Validation:**
```typescript
// lib/validations.ts
import { z } from 'zod';

export const createContactSchema = z.object({
  first_name: z.string()
    .min(1, 'First name required')
    .max(100, 'First name too long')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Invalid characters in first name'),
  
  last_name: z.string()
    .min(1, 'Last name required')
    .max(100, 'Last name too long')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Invalid characters in last name'),
  
  email: z.string()
    .email('Invalid email format')
    .max(255)
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
  
  company: z.string()
    .max(255, 'Company name too long')
    .optional(),
  
  address: z.object({
    street: z.string().max(255),
    city: z.string().max(100),
    postal_code: z.string().regex(/^[0-9]{5}$/),
    country: z.string().max(50)
  }).optional(),
  
  tags: z.array(z.string().max(50)).max(10).optional(),
  
  custom_fields: z.record(z.any()).optional()
});

export const updateContactSchema = createContactSchema.partial();
```

**API Route Usage:**
```typescript
// app/api/contacts/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createContactSchema.parse(body);
    
    // Proceed with validated data
    const contact = await prisma.contact.create({ data: validated });
    return Response.json({ success: true, data: contact });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    throw error;
  }
}
```

## SQL Injection Prevention

**Prisma ORM (Parameterized Queries):**
```typescript
// SAFE: Prisma auto-escapes
const contact = await prisma.contact.findMany({
  where: {
    email: userInput // Automatically sanitized
  }
});

// UNSAFE: Raw SQL (avoid)
// NEVER do this:
const result = await prisma.$queryRaw`
  SELECT * FROM contacts WHERE email = ${userInput}
`;

// If raw SQL needed, use parameterized:
const result = await prisma.$queryRaw`
  SELECT * FROM contacts WHERE email = ${Prisma.sql`${userInput}`}
`;
```

## XSS Prevention

**Content Security Policy:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.anthropic.com https://*.gemini.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};
```

**React XSS Protection:**
```typescript
// React auto-escapes by default
<div>{userInput}</div> // Safe

// Dangerous HTML (avoid):
// <div dangerouslySetInnerHTML={{ __html: userInput }} />

// If needed, sanitize first:
import DOMPurify from 'isomorphic-dompurify';

const sanitized = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

## CSRF Protection

**NextAuth.js CSRF Tokens:**
```typescript
// Automatic CSRF protection via NextAuth
// All state-changing requests require valid CSRF token

// Forms include hidden CSRF token:
<form method="POST" action="/api/contacts">
  <input type="hidden" name="csrfToken" value={csrfToken} />
  {/* ... */}
</form>

// API calls via fetch include CSRF header:
const response = await fetch('/api/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

## Data Encryption

### Encryption at Rest

**PostgreSQL Native Encryption:**
```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Field-level encryption for sensitive data
CREATE TABLE sensitive_data (
  id UUID PRIMARY KEY,
  encrypted_field BYTEA
);

-- Encrypt on insert
INSERT INTO sensitive_data (encrypted_field)
VALUES (pgp_sym_encrypt('sensitive value', 'encryption_key'));

-- Decrypt on select
SELECT pgp_sym_decrypt(encrypted_field, 'encryption_key') AS decrypted
FROM sensitive_data;
```

**Application-Level Encryption:**
```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

export function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Encryption in Transit

**TLS 1.3 Configuration:**
- All traffic: HTTPS only (Vercel enforces)
- Database connections: SSL mode required
- External APIs: HTTPS only

**Vercel SSL:**
```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://:path*',
        permanent: true
      }
    ];
  }
};
```

## Rate Limiting

**API Rate Limits:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Different limits for different endpoints
export const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
    analytics: true,
    prefix: 'ratelimit:api'
  }),
  
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts/15min
    analytics: true,
    prefix: 'ratelimit:auth'
  }),
  
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 calls/hour (free tier)
    analytics: true,
    prefix: 'ratelimit:ai'
  })
};

export async function checkRateLimit(
  identifier: string,
  type: keyof typeof rateLimiters = 'api'
) {
  const { success, limit, reset, remaining } = await rateLimiters[type].limit(identifier);
  
  return {
    allowed: success,
    limit,
    remaining,
    reset: new Date(reset)
  };
}
```

**Middleware Integration:**
```typescript
// middleware/rate-limit.ts
export async function rateLimitMiddleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, limit, remaining, reset } = await checkRateLimit(ip);
  
  if (!allowed) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': reset.getTime().toString(),
        'Retry-After': Math.ceil((reset.getTime() - Date.now()) / 1000).toString()
      }
    });
  }
  
  // Add rate limit headers to response
  return {
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.getTime().toString()
    }
  };
}
```

## RGPD (GDPR) Compliance

### Legal Basis

**Processing Activities:**
1. **Legitimate Interest:** CRM management, customer service
2. **Consent:** Marketing emails, analytics
3. **Contract:** Invoice processing, payment handling

### Data Subject Rights

#### Right to Access (Article 15)

**Implementation:**
```typescript
// app/api/gdpr/export/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  
  // Export all user data
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      contacts: true,
      vehicles: true,
      quotes: true,
      invoices: true,
      tasks: true,
      activities: true,
      user_consents: true
    }
  });
  
  // Remove sensitive fields
  delete userData.password;
  delete userData.mfa_secret;
  
  // Return as JSON file
  return new Response(JSON.stringify(userData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="my-data.json"'
    }
  });
}
```

#### Right to Deletion (Article 17)

**Implementation:**
```typescript
// app/api/gdpr/delete/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  
  // Soft delete first (30-day grace period)
  await prisma.user.update({
    where: { id: userId },
    data: { deleted_at: new Date() }
  });
  
  // Log deletion request
  await prisma.auditLog.create({
    data: {
      user_id: userId,
      action: 'gdpr_deletion_requested',
      entity_type: 'user',
      entity_id: userId
    }
  });
  
  // Schedule hard delete after 30 days (cron job)
  await redis.zadd('deletion_queue', Date.now() + 30 * 24 * 60 * 60 * 1000, userId);
  
  return Response.json({ success: true, message: 'Deletion scheduled in 30 days' });
}

// Cron job: Hard delete after 30 days
export async function hardDeleteExpired() {
  const now = Date.now();
  const expired = await redis.zrangebyscore('deletion_queue', 0, now);
  
  for (const userId of expired) {
    // Anonymize instead of delete (preserve referential integrity)
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@example.com`,
        name: 'Deleted User',
        password: null,
        mfa_secret: null,
        avatar_url: null
      }
    });
    
    // Delete PII from related records
    await prisma.contact.updateMany({
      where: { tenant: { users: { some: { id: userId } } } },
      data: {
        email: null,
        phone: null,
        address: null
      }
    });
    
    await redis.zrem('deletion_queue', userId);
  }
}
```

#### Right to Rectification (Article 16)

**Self-Service Update:**
```typescript
// Users can update their own data via UI
// app/api/users/me/route.ts
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const { name, email } = await req.json();
  
  const updated = await prisma.user.update({
    where: { id: session!.user.id },
    data: { name, email }
  });
  
  return Response.json({ success: true, data: updated });
}
```

### Consent Management

**Consent Tracking:**
```typescript
// app/api/consents/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const { marketing_emails, analytics } = await req.json();
  
  await prisma.userConsent.create({
    data: {
      user_id: session!.user.id,
      marketing_emails,
      analytics,
      ip_address: req.headers.get('x-forwarded-for') || undefined
    }
  });
  
  return Response.json({ success: true });
}

// Revoke consent
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  
  await prisma.userConsent.updateMany({
    where: { user_id: session!.user.id, revoked_at: null },
    data: { revoked_at: new Date() }
  });
  
  return Response.json({ success: true });
}
```

### Data Retention

**Retention Policies:**
```typescript
// Cron job: Delete old data
export async function enforceRetentionPolicies() {
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  // Delete inactive contacts (no activity in 3 years)
  await prisma.contact.updateMany({
    where: {
      updated_at: { lt: threeYearsAgo },
      activities: { none: { created_at: { gte: threeYearsAgo } } }
    },
    data: { deleted_at: new Date() }
  });
  
  // Delete old audit logs (>90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  await prisma.auditLog.deleteMany({
    where: { created_at: { lt: ninetyDaysAgo } }
  });
}
```

### PII Protection in Logs

**Log Redaction:**
```typescript
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  
  // Redact sensitive fields
  redact: {
    paths: [
      'email',
      'phone',
      'password',
      'api_key',
      'access_token',
      'refresh_token',
      'address',
      'vin',
      'license_plate'
    ],
    remove: true
  },
  
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      // Do NOT log body (may contain PII)
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  }
});

export default logger;
```

## Security Monitoring

### Audit Logging

**Audit Trail:**
```typescript
// lib/audit.ts
export async function logAuditEvent({
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  changes,
  ipAddress,
  userAgent
}: AuditLogParams) {
  await prisma.auditLog.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent
    }
  });
}

// Usage
await logAuditEvent({
  tenantId,
  userId,
  action: 'contact.deleted',
  entityType: 'contact',
  entityId: contactId,
  changes: { before: contactData, after: null },
  ipAddress: req.headers.get('x-forwarded-for'),
  userAgent: req.headers.get('user-agent')
});
```

### Intrusion Detection

**Suspicious Activity Monitoring:**
```typescript
// lib/security-monitor.ts
export async function detectSuspiciousActivity(userId: string) {
  const alerts = [];
  
  // Check: Multiple failed login attempts
  const failedLogins = await redis.get(`failed_logins:${userId}`);
  if (failedLogins && parseInt(failedLogins) > 5) {
    alerts.push({
      type: 'brute_force',
      severity: 'HIGH',
      message: 'Multiple failed login attempts detected'
    });
  }
  
  // Check: Unusual access patterns (e.g., 100 API calls in 1 minute)
  const recentCalls = await redis.get(`api_calls:${userId}:${Date.now()}`);
  if (recentCalls && parseInt(recentCalls) > 100) {
    alerts.push({
      type: 'api_abuse',
      severity: 'MEDIUM',
      message: 'Unusually high API usage detected'
    });
  }
  
  // Alert security team if critical
  if (alerts.some(a => a.severity === 'HIGH')) {
    await sendSecurityAlert(userId, alerts);
  }
  
  return alerts;
}
```

## Incident Response Plan

### Security Incident Levels

**Level 1 (Low):** Failed login attempts, minor rate limit violations
- **Action:** Log, monitor
- **Response Time:** 24 hours

**Level 2 (Medium):** Suspicious access patterns, API abuse
- **Action:** Log, alert security team, possible account suspension
- **Response Time:** 4 hours

**Level 3 (High):** Data breach, unauthorized access
- **Action:** Immediate lockdown, notify affected users, investigate
- **Response Time:** 1 hour

**Level 4 (Critical):** Widespread breach, system compromise
- **Action:** Full system lockdown, emergency response team, legal notification
- **Response Time:** Immediate

### Breach Notification

**RGPD Article 33/34 Compliance:**
```typescript
// lib/breach-notification.ts
export async function notifyDataBreach({
  affectedUsers,
  breachType,
  dataCompromised,
  mitigationSteps
}: BreachNotification) {
  // 1. Notify supervisory authority (CNIL) within 72 hours
  await notifyCNIL({
    date: new Date(),
    type: breachType,
    affectedCount: affectedUsers.length,
    dataTypes: dataCompromised,
    mitigation: mitigationSteps
  });
  
  // 2. Notify affected users without undue delay
  for (const user of affectedUsers) {
    await sendEmail({
      to: user.email,
      subject: 'Important: Data Breach Notification',
      template: 'breach-notification',
      data: {
        name: user.name,
        breachType,
        dataCompromised,
        mitigationSteps,
        contactEmail: 'security@visioncrm.app'
      }
    });
  }
  
  // 3. Log internally
  await prisma.auditLog.create({
    data: {
      action: 'security_breach',
      entity_type: 'system',
      changes: {
        affected_users: affectedUsers.length,
        breach_type: breachType,
        notified_at: new Date()
      }
    }
  });
}
```

---

**Last Updated:** 2026-01-01  
**Version:** 1.0  
**Compliance:** RGPD (French GDPR)
