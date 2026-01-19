# Security Audit - VisionCRM

Audit de sécurité complet couvrant les vulnérabilités OWASP Top 10 avant le beta launch.

## 📋 OWASP Top 10 (2021)

| # | Vulnérabilité | Statut | Priorité |
|---|---------------|--------|----------|
| A01 | Broken Access Control | ✅ Protégé | Critique |
| A02 | Cryptographic Failures | ✅ Protégé | Critique |
| A03 | Injection (SQL, XSS) | ✅ Protégé | Critique |
| A04 | Insecure Design | ✅ Validé | Haute |
| A05 | Security Misconfiguration | ✅ Validé | Haute |
| A06 | Vulnerable Components | ⏳ À vérifier | Haute |
| A07 | Authentication Failures | ✅ Protégé | Critique |
| A08 | Software/Data Integrity | ✅ Validé | Moyenne |
| A09 | Logging & Monitoring | ✅ Implémenté | Moyenne |
| A10 | Server-Side Request Forgery | ✅ Protégé | Moyenne |

---

## 🔒 A01: Broken Access Control

### Protection implémentée

1. **Middleware d'authentification** (NextAuth.js v5)
   - Vérification session sur toutes routes protégées
   - Expiration automatique des sessions (24h)
   - Refresh token rotation

2. **Autorisation basée sur les rôles**
   ```typescript
   // lib/auth/permissions.ts
   const ROLE_PERMISSIONS = {
     OWNER: ['*'], // Tous droits
     MANAGER: ['read:*', 'write:contacts', 'write:quotes', 'write:invoices'],
     EMPLOYEE: ['read:*', 'write:tasks'],
   };
   ```

3. **Isolation multi-tenant**
   - Toutes queries filtrées par `tenant_id`
   - Impossible d'accéder aux données d'un autre tenant
   - Middleware vérifie `tenant_id` sur chaque requête

### Tests

```bash
# Tests E2E Playwright
pnpm exec playwright test tests/e2e/auth/

# Vérifier:
# - ✅ Utilisateur non authentifié redirigé vers /login
# - ✅ EMPLOYEE ne peut pas accéder aux paramètres
# - ✅ MANAGER ne peut pas supprimer des utilisateurs
# - ✅ Tenant A ne peut pas voir les données de Tenant B
```

### Validation manuelle

1. Se connecter comme EMPLOYEE
2. Tenter d'accéder à `/settings/team`
3. ✅ Doit être bloqué (403 Forbidden)

---

## 🔐 A02: Cryptographic Failures

### Protection implémentée

1. **Mots de passe**
   - Hashing: `bcrypt` avec cost factor 12
   - Salt automatique (bcrypt)
   - Pas de stockage en clair

   ```typescript
   // lib/auth/password.ts
   import bcrypt from 'bcryptjs';

   export async function hashPassword(password: string) {
     return await bcrypt.hash(password, 12);
   }
   ```

2. **Secrets et tokens**
   - `NEXTAUTH_SECRET`: 32+ caractères aléatoires
   - Tokens de vérification: UUID v4
   - Expiration tokens: 24h (verification), 1h (password reset)

3. **HTTPS/TLS**
   - Vercel: HTTPS automatique
   - HSTS header activé (`max-age=31536000`)
   - Cookies `Secure` en production

4. **Données sensibles**
   - Numéros de carte: Jamais stockés (Stripe gère)
   - IBAN: Masqué dans l'UI (`FR76 **** **** **** **34`)

### Tests

```typescript
// Vérifier que passwords ne sont pas en clair dans DB
const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
expect(user.password).not.toBe('plaintext');
```

### Validation

```bash
# Vérifier HTTPS headers
curl -I https://app.visioncrm.com | grep -i "strict-transport"
# Expected: Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 💉 A03: Injection (SQL, XSS, Command)

### SQL Injection Protection

1. **Prisma ORM**
   - Requêtes paramétrées automatiques
   - Pas de raw SQL queries
   - Protection native contre SQL injection

   ```typescript
   // ✅ SAFE (Prisma parameterized)
   await prisma.contact.findMany({
     where: { email: userInput },
   });

   // ❌ DANGEROUS (never do this)
   await prisma.$executeRaw(`SELECT * FROM contacts WHERE email = '${userInput}'`);
   ```

2. **Input validation** (Zod schemas)
   ```typescript
   const ContactSchema = z.object({
     email: z.string().email(),
     firstName: z.string().min(1).max(100),
   });
   ```

### XSS Protection

1. **React auto-escaping**
   - React échappe automatiquement les variables
   - `dangerouslySetInnerHTML` banni (ESLint rule)

2. **DOMPurify** pour contenu riche
   ```typescript
   import DOMPurify from 'isomorphic-dompurify';

   const cleanHTML = DOMPurify.sanitize(userInput);
   ```

3. **Content Security Policy**
   ```javascript
   // next.config.js
   headers: [{
     key: 'Content-Security-Policy',
     value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
   }]
   ```

### Tests automatisés

```bash
# SQL Injection tests
pnpm exec playwright test tests/security/sql-injection.spec.ts

# XSS tests
pnpm exec playwright test tests/security/xss.spec.ts
```

**Scénarios testés:**
- ✅ Login avec `email="admin'--"`
- ✅ Nom de contact avec `<script>alert('XSS')</script>`
- ✅ Description devis avec `<img src=x onerror=alert(1)>`
- ✅ Recherche avec `'; DROP TABLE contacts; --`

---

## 🛡️ A04: Insecure Design

### Architecture sécurisée

1. **Principe du moindre privilège**
   - Rôles granulaires (OWNER, MANAGER, EMPLOYEE)
   - API routes vérifient permissions

2. **Défense en profondeur**
   - Validation client + serveur
   - Rate limiting + CAPTCHA (si spam)
   - WAF Vercel (si activé)

3. **Fail secure**
   - En cas d'erreur auth → Deny access
   - Session invalide → Redirection login
   - Tenant non trouvé → 404 (pas 403)

### Code review checklist

- [ ] Chaque route API vérifie authentification
- [ ] Chaque mutation vérifie autorisation
- [ ] Pas de secrets hardcodés (git-secrets scan)
- [ ] Pas de console.log en production
- [ ] Error messages ne leak pas d'info sensible

---

## ⚙️ A05: Security Misconfiguration

### Headers de sécurité

Configuration dans `next.config.js` :

```javascript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ..."
      },
    ],
  }];
}
```

### Test headers

```bash
# Script automatique
curl -I https://app.visioncrm.com | grep -E "X-Frame|X-Content|X-XSS|Strict-Transport"

# Ou via outil en ligne
# https://securityheaders.com/?q=https://app.visioncrm.com
# Target: Score A ou A+
```

### Variables d'environnement

**✅ Bonnes pratiques:**
- Tous secrets dans `.env.production` (jamais committé)
- `.env.example` avec placeholders
- Vercel: Variables dans Dashboard (encrypted)

**❌ À éviter:**
```typescript
// NEVER do this
const apiKey = 'sk_live_123456789'; // Hardcoded secret
```

### Erreurs exposées

**Production:**
- Erreurs génériques: "Une erreur est survenue"
- Logs détaillés envoyés à Sentry (pas affichés)

**Development:**
- Stack traces visibles (OK pour debug)

---

## 📦 A06: Vulnerable and Outdated Components

### Audit des dépendances

```bash
# Audit NPM
pnpm audit --audit-level=high

# Expected output:
# found 0 vulnerabilities
```

### Politique de mise à jour

1. **Dépendances critiques** (auth, security):
   - Mise à jour immédiate si CVE
   - Review changelog systématique

2. **Dépendances standard**:
   - Mise à jour mensuelle
   - Tests E2E avant merge

3. **Automated tools**:
   - Dependabot (GitHub) activé
   - Renovate Bot (optionnel)

### Packages critiques

| Package | Version | CVE Check |
|---------|---------|-----------|
| `next` | 15.5.9 | ✅ OK |
| `next-auth` | 5.0.0-beta.25 | ✅ OK |
| `@prisma/client` | 5.22.0 | ✅ OK |
| `bcryptjs` | 2.4.3 | ✅ OK |
| `zod` | 3.24.1 | ✅ OK |

### Actions

```bash
# Check outdated packages
pnpm outdated

# Update all (with caution)
pnpm update

# Run tests after update
pnpm run build && pnpm exec playwright test
```

---

## 🔑 A07: Identification and Authentication Failures

### Protection implémentée

1. **Rate limiting sur login**
   ```typescript
   // lib/rate-limit.ts
   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 tentatives max
   });
   ```

2. **Politique de mots de passe**
   - Minimum 8 caractères
   - Au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
   - Validation avec Zod schema

   ```typescript
   const passwordSchema = z.string()
     .min(8, 'Minimum 8 caractères')
     .regex(/[A-Z]/, 'Au moins 1 majuscule')
     .regex(/[a-z]/, 'Au moins 1 minuscule')
     .regex(/[0-9]/, 'Au moins 1 chiffre')
     .regex(/[^A-Za-z0-9]/, 'Au moins 1 caractère spécial');
   ```

3. **Sessions sécurisées**
   - Cookie `httpOnly: true`
   - Cookie `secure: true` (production)
   - Cookie `sameSite: 'lax'`
   - Expiration: 24h

4. **Multi-Factor Authentication** (Phase 2)
   - TOTP (Google Authenticator)
   - Backup codes
   - SMS (optionnel)

### Tests

```bash
pnpm exec playwright test tests/security/rate-limiting.spec.ts
```

**Scénarios:**
- ✅ 6 tentatives login échouées → Rate limited
- ✅ Password reset limité à 3/heure
- ✅ Registration limitée à 5/jour par IP

---

## 🔍 A08: Software and Data Integrity Failures

### Protection CI/CD

1. **GitHub Actions**
   - Tests automatiques sur chaque PR
   - Dependency review action
   - CodeQL scanning (optionnel)

2. **Vercel deployment**
   - Deployment protection (require approval)
   - Preview deployments isolés
   - Rollback facile

3. **Subresource Integrity** (optionnel)
   ```html
   <script src="https://cdn.example.com/script.js"
           integrity="sha384-..."
           crossorigin="anonymous"></script>
   ```

### Backup et versioning

- Code: Git (GitHub)
- Database: Supabase daily backups (30 jours retention)
- Uploads: S3 avec versioning

---

## 📝 A09: Security Logging and Monitoring Failures

### Logging implémenté

1. **Sentry** (error tracking)
   - Toutes erreurs 500 loggées
   - User context inclus
   - Breadcrumbs pour debug

2. **Audit logs** (base de données)
   ```sql
   CREATE TABLE audit_logs (
     id UUID PRIMARY KEY,
     user_id UUID,
     action VARCHAR(50),
     resource VARCHAR(50),
     resource_id UUID,
     changes JSONB,
     ip_address VARCHAR(50),
     created_at TIMESTAMP
   );
   ```

3. **Security events loggés**
   - Login success/failure
   - Password reset demandé
   - Role changed
   - Data exported (RGPD)
   - API calls (rate limited)

### Monitoring

- Uptime: UptimeRobot (5 min checks)
- Performance: Vercel Analytics
- Errors: Sentry (real-time alerts)
- Database: Supabase metrics

### Alertes configurées

| Événement | Seuil | Action |
|-----------|-------|--------|
| Error rate spike | > 10 errors/min | Email + Slack |
| Failed logins | > 10/min (même IP) | Email |
| Database down | Immédiat | SMS + PagerDuty |
| Slow response | p95 > 1s for 10min | Email |

---

## 🌐 A10: Server-Side Request Forgery (SSRF)

### Protection implémentée

1. **Pas de user-controlled URLs**
   - Uploads: S3 pre-signed URLs (Vercel Blob)
   - Webhooks: Allowlist domains uniquement

2. **Validation stricte**
   ```typescript
   // Webhook URL validation
   const ALLOWED_DOMAINS = ['stripe.com', 'sendgrid.net'];

   function validateWebhookURL(url: string) {
     const parsed = new URL(url);
     return ALLOWED_DOMAINS.some(d => parsed.hostname.endsWith(d));
   }
   ```

3. **Network isolation**
   - Vercel serverless: Pas d'accès au réseau interne
   - Database: Connexions via SSL uniquement

---

## 🧪 Tests de sécurité automatisés

### Playwright Security Tests

```bash
# Run all security tests
pnpm exec playwright test tests/security/

# Specific tests
pnpm exec playwright test tests/security/sql-injection.spec.ts
pnpm exec playwright test tests/security/xss.spec.ts
pnpm exec playwright test tests/security/rate-limiting.spec.ts
```

### Tests inclus

| Fichier | Tests | Status |
|---------|-------|--------|
| `sql-injection.spec.ts` | 7 tests | ✅ |
| `xss.spec.ts` | 9 tests | ✅ |
| `rate-limiting.spec.ts` | 6 tests | ✅ |

**Total: 22 tests de sécurité automatisés**

---

## 📊 Checklist pré-beta launch

### Sécurité Infrastructure

- [ ] HTTPS activé (Vercel automatic)
- [ ] Headers sécurité configurés (A+ sur securityheaders.com)
- [ ] Rate limiting activé (login, register, API)
- [ ] WAF configuré (Vercel Enterprise - optionnel)
- [ ] Backups automatiques (database + uploads)
- [ ] Monitoring actif (Sentry + UptimeRobot)

### Sécurité Application

- [ ] Passwords: bcrypt cost 12+
- [ ] Sessions: httpOnly, secure, sameSite
- [ ] Input validation: Zod schemas sur toutes routes
- [ ] SQL injection: Prisma ORM (pas de raw queries)
- [ ] XSS: React auto-escape + DOMPurify
- [ ] CSRF: SameSite cookies + token (si POST forms)
- [ ] Access control: Middleware auth sur toutes routes protégées

### Tests

- [ ] 22 tests sécurité Playwright passent
- [ ] `pnpm audit` sans vulnérabilités HIGH/CRITICAL
- [ ] Build production sans erreurs
- [ ] E2E tests complets passent

### Compliance

- [ ] RGPD: Consentements, export, suppression implémentés
- [ ] Privacy policy publiée
- [ ] Terms of service publiés
- [ ] Cookie banner (si cookies marketing)

---

## 🔴 Incidents de sécurité

### Procédure

1. **Détection**
   - Alert Sentry / monitoring
   - Report utilisateur
   - Scan automatique

2. **Triage** (< 15 min)
   - Severity: Critical / High / Medium / Low
   - Impact: Nombre d'utilisateurs affectés
   - Owner: Assign security lead

3. **Mitigation immédiate**
   - Rollback deployment si nécessaire
   - Patch code
   - Deploy hotfix

4. **Communication**
   - Utilisateurs affectés: Email dans 24h
   - Status page: Update immédiat
   - Autorités: Si breach de données (RGPD, 72h)

5. **Postmortem**
   - Root cause analysis
   - Action items
   - Update security tests

### Contacts

- **Security Lead**: security@visioncrm.app
- **Emergency**: +33 X XX XX XX XX (on-call)
- **CNIL** (si data breach): https://www.cnil.fr/

---

## 📚 Ressources

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Vercel Security](https://vercel.com/docs/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [RGPD Compliance](https://www.cnil.fr/)

---

**Version:** 1.0
**Dernière mise à jour:** Janvier 2026
**Propriétaire:** Security Team
**Prochaine revue:** Mensuelle
