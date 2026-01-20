# ⚡ Quick Start Deployment - vision-crm.app

Guide rapide pour déployer VisionCRM sur `vision-crm.app` avec Resend.

---

## 🎯 Résumé de votre configuration

- ✅ **Domaine:** `vision-crm.app` (acheté sur Vercel)
- ✅ **Plateforme:** Vercel
- ✅ **Email:** Resend (à configurer)
- ⏳ **Database:** À configurer (Supabase recommandé)
- ⏳ **Monitoring:** À configurer (Sentry + UptimeRobot)

---

## 📋 Checklist Configuration (30 min)

### ☐ 1. Configuration DNS Email Resend (10 min)

**A. Créer compte Resend**
- Aller sur https://resend.com/signup
- Créer compte gratuit (3,000 emails/mois)

**B. Ajouter domaine**
1. Dashboard Resend → **Domains** → **Add Domain**
2. Entrer: `vision-crm.app`
3. Cliquer **Add**

**C. Copier records DNS**

Resend va afficher 3 records. **IMPORTANT:** Gardez cette page ouverte !

**D. Ajouter dans Vercel DNS**

1. Aller sur Vercel Dashboard → Domains → `vision-crm.app` → **DNS**
2. Ajouter ces 3 records (copier depuis Resend) :

```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

```
Type: TXT
Name: resend._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0... (COPIER depuis Resend !)
```

```
Type: CNAME
Name: em#### (fourni par Resend)
Value: resend.net
```

3. **Optionnel mais recommandé:** Ajouter DMARC

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@vision-crm.app; pct=100
```

**E. Vérifier dans Resend**
- Attendre 5-10 min
- Resend → Domains → Cliquer **Verify**
- Status doit être ✅ **Verified**

---

### ☐ 2. Variables d'environnement Vercel (5 min)

**Aller sur:** Vercel Dashboard → Settings → **Environment Variables**

**Ajouter ces variables** (pour Production, Preview, Development) :

#### Email Resend

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx  # Copier depuis Resend → API Keys
EMAIL_FROM="VisionCRM <noreply@vision-crm.app>"
EMAIL_REPLY_TO="support@vision-crm.app"
```

#### NextAuth

```bash
NEXTAUTH_URL=https://vision-crm.app
NEXTAUTH_SECRET=XXXXXXXX  # Générer avec: openssl rand -base64 32
```

**💡 Générer NEXTAUTH_SECRET:**

```bash
# Dans terminal
openssl rand -base64 32

# Exemple output:
# 8kJh4Nf9mP2qR7sT3vX5yZ1aB6cD8eF0
# ← Copier et coller dans NEXTAUTH_SECRET
```

#### Database (Supabase - voir section 3)

```bash
DATABASE_URL=postgresql://...  # Depuis Supabase (étape 3)
DIRECT_URL=postgresql://...    # Depuis Supabase (étape 3)
```

#### Monitoring (Optionnel)

```bash
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

### ☐ 3. Database Supabase (10 min)

**A. Créer projet**
1. Aller sur https://supabase.com
2. **New project**
   - Name: `VisionCRM Production`
   - Database Password: [générer fort - SAUVEGARDER !]
   - Region: **Frankfurt (eu-central-1)** [EU, RGPD compliant]
3. Cliquer **Create new project**
4. Attendre 2-3 min (provisioning)

**B. Copier connection strings**

1. Settings → **Database** → **Connection string**
2. Mode: **Session** (connection pooling)
3. Copier les 2 URLs:

```bash
# Connection pooling (pour DATABASE_URL)
postgresql://postgres.[ref].supabase.co:6543/postgres?pgbouncer=true

# Direct connection (pour DIRECT_URL)
postgresql://postgres.[ref].supabase.co:5432/postgres
```

4. **Remplacer** `[YOUR-PASSWORD]` par votre vrai password !

**C. Ajouter dans Vercel env vars** (voir section 2)

**D. Lancer migrations** (depuis votre machine locale)

```bash
# Ajouter dans .env.local
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Générer Prisma client
pnpm prisma generate

# Déployer migrations
pnpm prisma migrate deploy

# (Optionnel) Seed demo data
pnpm db:seed
```

✅ Database prête !

---

### ☐ 4. GitHub Actions Secrets (5 min)

**Aller sur:** GitHub → Settings → **Secrets and variables** → **Actions**

**A. Obtenir tokens Vercel**

```bash
# Terminal local (racine projet)
vercel login
vercel link

# Lire IDs
cat .vercel/project.json
```

Output:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

**B. Créer Vercel Token**
1. https://vercel.com/account/tokens
2. **Create Token**
3. Name: `GitHub Actions CI/CD`
4. Copier le token (commence par `vercel_...`)

**C. Ajouter 3 secrets dans GitHub:**

```
Name: VERCEL_TOKEN
Value: vercel_xxxxxxxxxxxxxxxxxxxxxxxx

Name: VERCEL_ORG_ID
Value: team_xxxxxxxxxxxxx

Name: VERCEL_PROJECT_ID
Value: prj_xxxxxxxxxxxxx
```

✅ CI/CD prêt !

---

## 🧪 Tests Validation (15 min)

### Test 1: Email Deliverability

```bash
# 1. Installer dépendance
pnpm add resend

# 2. Ajouter dans .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx  # Depuis Resend

# 3. Éditer scripts/test-email-deliverability.ts
# Aller sur https://www.mail-tester.com/
# Copier l'adresse email unique
# Remplacer TEST_EMAIL dans le script

# 4. Exécuter test
npx tsx scripts/test-email-deliverability.ts

# 5. Vérifier score sur mail-tester.com
# Target: > 8/10 ✅
```

### Test 2: Build Local

```bash
pnpm run build

# Expected:
# ✓ Generating static pages (97/97)
# Route (app)                              Size  First Load JS
# ✓ Compiled successfully in X.Xs
```

### Test 3: Load Test (après déploiement staging)

```bash
# Installer k6
# macOS:
brew install k6

# Windows:
choco install k6

# Exécuter test sur staging
k6 run --env BASE_URL=https://vision-crm.vercel.app tests/load/load-test-simple.js

# Expected:
# ✓ http_req_duration........: p(95)=420ms  [PASS < 500ms]
# ✓ http_req_failed..........: 0.8%         [PASS < 5%]
```

### Test 4: Lighthouse

```bash
# Via CLI
lighthouse https://vision-crm.app --output html --view

# Via web
# https://pagespeed.web.dev/?url=https://vision-crm.app

# Target:
# Performance: ≥ 90
# Accessibility: ≥ 95
# Best Practices: ≥ 95
# SEO: ≥ 90
```

---

## 🚀 Déploiement

### Déploiement Staging (Automatique)

```bash
# 1. Créer branch develop
git checkout -b develop
git push origin develop

# 2. GitHub Actions démarre automatiquement
# Vérifier: GitHub → Actions

# 3. Si succès → Deploy automatique vers Vercel staging
# URL: https://vision-crm-git-develop-[your-team].vercel.app
```

### Déploiement Production

```bash
# 1. Merger develop vers main
git checkout main
git merge develop
git push origin main

# 2. GitHub Actions démarre
# 3. Après tests OK → Deploy production
# URL: https://vision-crm.app

# 4. Vérifier
curl https://vision-crm.app
# Expected: 200 OK
```

---

## 🔍 Monitoring Setup (Optionnel - 10 min)

### Sentry (Error Tracking)

1. https://sentry.io/signup/
2. Create project: `VisionCRM`
3. Platform: `Next.js`
4. Copy DSN: `https://xxxxx@sentry.io/xxxxx`
5. Ajouter dans Vercel env vars:
   ```
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

### UptimeRobot (Uptime Monitoring)

1. https://uptimerobot.com/
2. **Add New Monitor**
   - Monitor Type: HTTPS
   - Friendly Name: `VisionCRM Production`
   - URL: `https://vision-crm.app`
   - Monitoring Interval: `5 minutes`
3. Alert Contacts: votre email

---

## 📊 Résumé Final

Après avoir suivi ce guide, vous aurez :

- ✅ DNS email configuré (SPF/DKIM/DMARC)
- ✅ Variables d'environnement Vercel
- ✅ Database Supabase prête
- ✅ GitHub Actions CI/CD opérationnel
- ✅ Tests validés (email, build, load, lighthouse)
- ✅ Déploiement staging + production
- ✅ Monitoring configuré

**Production Readiness:** 9.8/10 → **10/10** ✅

---

## 🆘 Troubleshooting

### Email non reçu

```bash
# Vérifier DNS
dig TXT vision-crm.app
dig TXT resend._domainkey.vision-crm.app

# Vérifier logs Resend
# Dashboard → Logs → Voir erreurs
```

### Build failed

```bash
# Vérifier logs Vercel
# Dashboard → Deployments → [latest] → View Logs

# Build local
pnpm run build
# Fixer erreurs affichées
```

### Database connection failed

```bash
# Vérifier connection string
echo $DATABASE_URL

# Tester connexion
pnpm prisma db pull
# Si erreur: vérifier password, host, port
```

---

## 📞 Support

**Documentation complète:**
- `DEPLOYMENT_SETUP.md` - Guide détaillé
- `docs/deployment/EMAIL_DELIVERABILITY.md` - Email config
- `docs/deployment/PRODUCTION_CHECKLIST.md` - Checklist complète

**En cas de blocage:**
1. Vérifier logs Vercel Dashboard
2. Vérifier logs GitHub Actions
3. Consulter documentation Vercel/Resend/Supabase

---

**Version:** 1.0
**Domaine:** vision-crm.app
**Durée totale:** ~30-40 min

**Ready to launch!** 🚀
