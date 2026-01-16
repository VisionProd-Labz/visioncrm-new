# 🚨 CORRECTIONS CRITIQUES AVANT PRODUCTION

## SÉCURITÉ - PRIORITÉ MAXIMALE

### 1. FUITE DE DONNÉES MULTI-TENANT (CRITIQUE)

**Problème:** Le middleware Prisma n'inclut pas tous les modèles tenant-aware.

**Fichiers affectés:**
- `lib/prisma.ts` ligne 22-42
- Modèles manquants: Document, EmailLog, Project, EmailTemplate, PaymentTerm, CustomPaymentMethod, etc.

**Fix immédiat:**

```typescript
// lib/prisma.ts - AJOUTER TOUS LES MODÈLES
const modelsWithTenant = [
  'User', 'Contact', 'Vehicle', 'Quote', 'Invoice', 'Task',
  'Activity', 'AIUsage', 'Webhook', 'AuditLog',
  // ⚠️ AJOUTER CES MODÈLES CRITIQUES:
  'Document', 'EmailLog', 'Project', 'EmailTemplate',
  'PaymentTerm', 'CustomPaymentMethod', 'VatRate',
  'CatalogItem', 'Event', 'Conversation', 'Message',
  'BankAccount', 'BankTransaction', 'Expense',
  'InventoryItem', 'TaxDocument', 'PayrollDocument',
  'LegalDocument', 'FinancialReport', 'Litigation',
];
```

**Test de validation:**
```sql
-- Vérifier qu'aucune donnée cross-tenant n'existe
SELECT
  t1.id as tenant1_id,
  t2.id as tenant2_id,
  d.id as document_id,
  d.tenant_id
FROM tenants t1
CROSS JOIN tenants t2
JOIN documents d ON d.tenant_id = t1.id
WHERE t1.id != t2.id;
-- Résultat attendu: 0 lignes
```

---

### 2. RATE LIMITING DÉSACTIVÉ (CRITIQUE)

**Problème:** Redis commenté, fallback mémoire non persistant.

**Fichier:** `lib/rate-limit.ts` ligne 1-12

**Fix production:**

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

if (!redis && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL: Redis required in production for rate limiting');
}
```

**Variables Vercel requises:**
```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Créer compte Upstash (gratuit):**
1. https://upstash.com
2. Créer base Redis
3. Copier URL + Token dans Vercel

---

### 3. PERMISSIONS NON APPLIQUÉES (HAUTE)

**Problème:** Matrice de permissions existe mais jamais vérifiée dans les API routes.

**Exemple vulnérabilité:**
```typescript
// app/api/contacts/[id]/route.ts
// Un USER peut supprimer un contact alors qu'il devrait être READ_ONLY
export async function DELETE(req, { params }) {
  // ❌ MANQUE: Vérification permission 'contacts:delete'
  await prisma.contact.delete({ where: { id } });
}
```

**Fix - Créer middleware de permissions:**

```typescript
// lib/middleware/permissions.ts
import { auth } from '@/auth';
import { hasPermission } from '@/lib/permissions';
import { NextResponse } from 'next/server';

export async function requirePermission(permission: string) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (!hasPermission(role, permission)) {
    return NextResponse.json(
      { error: 'Permission insuffisante', required: permission },
      { status: 403 }
    );
  }

  return null; // Permission OK
}
```

**Usage dans les routes:**

```typescript
// app/api/contacts/[id]/route.ts
import { requirePermission } from '@/lib/middleware/permissions';

export async function DELETE(req, { params }) {
  // ✅ Vérifier permission
  const permError = await requirePermission('contacts:delete');
  if (permError) return permError;

  const { id } = await params;
  const tenantId = await requireTenantId();

  await prisma.contact.update({
    where: { id },
    data: { deleted_at: new Date() }
  });

  return NextResponse.json({ success: true });
}
```

---

### 4. LOGS SENSIBLES EN PRODUCTION (HAUTE)

**Problème:** Emails, IDs, tokens loggés en clair.

**Fichier:** `auth.ts` lignes 21-50

**Fix:**

```typescript
// auth.ts - SUPPRIMER TOUS CES LOGS
// ❌ À RETIRER:
console.log('🔑 [AUTHORIZE V5] Email:', credentials?.email);
console.log('🔑 [AUTHORIZE V5] User found:', !!user);
console.log('📧 [AUTHORIZE V5] Email verified:', user.emailVerified);

// ✅ Si logs nécessaires, masquer données:
if (process.env.NODE_ENV === 'development') {
  console.log('[AUTH] Login attempt:', credentials?.email?.replace(/(?<=.{2}).*(?=@)/, '***'));
}
```

---

### 5. CSRF PROTECTION (HAUTE)

**Problème:** Pas de vérification explicite des tokens CSRF.

**Fix - Ajouter vérification dans middleware:**

```typescript
// middleware.ts - Ajouter après ligne 20
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // ... code existant ...

  // ✅ CSRF Protection pour mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin && !origin.includes(host || '')) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }
  }

  // ... reste du code ...
}
```

---

## VALIDATION DONNÉES - PRIORITÉ HAUTE

### 6. Sanitization HTML

**Problème:** Pas d'échappement sur les inputs texte.

**Fix:**

```bash
pnpm add dompurify isomorphic-dompurify
```

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Pas de HTML autorisé
    ALLOWED_ATTR: []
  });
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprimer < et >
    .substring(0, 1000); // Limite longueur
}
```

**Usage dans validations:**

```typescript
// lib/validations.ts
import { sanitizeInput } from './sanitize';

export const contactSchema = z.object({
  first_name: z.string()
    .min(1)
    .max(100)
    .transform(sanitizeInput), // ✅
  last_name: z.string()
    .min(1)
    .max(100)
    .transform(sanitizeInput), // ✅
  email: z.string()
    .email()
    .toLowerCase()
    .transform(sanitizeInput),
});
```

---

### 7. Validation IBAN/BIC

**Fix:**

```bash
pnpm add ibantools
```

```typescript
// lib/accounting/validations.ts
import { isValidIBAN, isValidBIC } from 'ibantools';

export const bankAccountSchema = z.object({
  // ...
  iban: z.string()
    .optional()
    .refine((val) => !val || isValidIBAN(val), {
      message: 'IBAN invalide'
    }),
  bic: z.string()
    .optional()
    .refine((val) => !val || isValidBIC(val), {
      message: 'BIC invalide'
    }),
});
```

---

### 8. Edge Cases Devis/Factures

```typescript
// lib/validations.ts
export const quoteSchema = z.object({
  items: z.array(itemSchema)
    .min(1, 'Au moins un article requis'), // ✅

  valid_until: z.date()
    .refine((date) => date > new Date(), {
      message: 'La date de validité doit être future'
    }), // ✅

  // ...
}).refine((data) => {
  // ✅ Vérifier cohérence montants
  const calculatedTotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  return Math.abs(calculatedTotal - data.subtotal) < 0.01;
}, {
  message: 'Incohérence dans les montants'
});
```

---

## PERFORMANCE - PRIORITÉ MOYENNE

### 9. Pagination Manquante

**Fichiers à corriger:**
- `app/api/contacts/route.ts`
- `app/api/quotes/route.ts`
- `app/api/invoices/route.ts`
- `app/api/vehicles/route.ts`

**Fix standard:**

```typescript
// app/api/contacts/route.ts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      take: limit,
      skip,
      orderBy: { created_at: 'desc' },
    }),
    prisma.contact.count({ where }),
  ]);

  return NextResponse.json({
    contacts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
```

---

### 10. Caching Dashboard Stats

**Fix - Ajouter cache Redis:**

```typescript
// app/api/dashboard/stats/route.ts
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const tenantId = await requireTenantId();
  const cacheKey = `dashboard:stats:${tenantId}`;

  // ✅ Check cache
  const cached = await redis?.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }

  // Calcul stats (code existant)
  const stats = { /* ... */ };

  // ✅ Cache 5 minutes
  await redis?.setex(cacheKey, 300, JSON.stringify(stats));

  return NextResponse.json(stats);
}
```

---

## TESTS - PRIORITÉ HAUTE

### 11. Setup Testing

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

**Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**Tests critiques à ajouter:**

```typescript
// tests/api/contacts.test.ts
import { describe, it, expect } from 'vitest';

describe('Contacts API - Security', () => {
  it('should prevent cross-tenant data access', async () => {
    // Test isolation tenant
  });

  it('should require contacts:read permission', async () => {
    // Test permissions
  });

  it('should sanitize HTML in inputs', async () => {
    // Test XSS prevention
  });
});
```

---

## DÉPLOIEMENT SÉCURISÉ

### Checklist Pre-Production

```bash
# 1. Variables d'environnement requises
✅ DATABASE_URL (avec sslmode=require)
✅ AUTH_SECRET (32+ caractères)
✅ AUTH_URL (URL production exacte)
✅ UPSTASH_REDIS_REST_URL
✅ UPSTASH_REDIS_REST_TOKEN
✅ RESEND_API_KEY
✅ NODE_ENV=production

# 2. Vérifications sécurité
□ Middleware Prisma complet
□ Rate limiting activé
□ Permissions appliquées
□ Logs nettoyés
□ CSRF protection
□ Tests passent (>80% coverage)
□ Audit sécurité (npm audit)
□ Backup DB configuré

# 3. Performance
□ Pagination implémentée
□ Cache Redis actif
□ Index DB optimisés
□ Monitoring (Sentry, Vercel Analytics)
```

---

## TIMELINE DE CORRECTION

### Sprint 1 - CRITIQUE (3-5 jours)
- [ ] Middleware Prisma complet
- [ ] Rate limiting Redis
- [ ] Supprimer logs sensibles
- [ ] CSRF protection

### Sprint 2 - HAUTE (1 semaine)
- [ ] Permissions API routes
- [ ] Sanitization HTML
- [ ] Tests unitaires (>50%)
- [ ] Validation IBAN/BIC

### Sprint 3 - MOYENNE (2 semaines)
- [ ] Pagination partout
- [ ] Cache Redis stats
- [ ] Edge cases gérés
- [ ] Monitoring/alerting

---

## COMMANDES UTILES

```bash
# Audit sécurité npm
pnpm audit

# Vérifier types
pnpm tsc --noEmit

# Lancer tests
pnpm test

# Build production
pnpm build

# Analyser bundle
pnpm analyze
```
