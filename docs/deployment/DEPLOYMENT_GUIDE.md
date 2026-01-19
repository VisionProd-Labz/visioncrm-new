# Guide de déploiement - VisionCRM

Guide étape par étape pour déployer VisionCRM en production.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir:

- [ ] Accès au repository GitHub
- [ ] Compte Vercel (ou AWS/autres hébergeur)
- [ ] Base de données PostgreSQL prête
- [ ] Domaine configuré (app.visioncrm.com)
- [ ] Compte SMTP pour emails
- [ ] Compte Sentry pour monitoring

---

## 🚀 Déploiement sur Vercel (Recommandé)

### Option 1: Déploiement via Vercel CLI

#### 1. Installation Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login Vercel

```bash
vercel login
```

#### 3. Configuration du projet

```bash
# À la racine du projet
cd /path/to/visioncrm

# Link to Vercel project
vercel link
```

**Répondez aux questions:**
- Set up and deploy "~/visioncrm"? `Y`
- Which scope? Select your team/account
- Link to existing project? `Y` (si projet existe) ou `N` (nouveau)
- Project name? `visioncrm-production`

#### 4. Configuration des variables d'environnement

```bash
# Ajoutez toutes les variables une par une
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add EMAIL_SERVER_HOST production
vercel env add EMAIL_SERVER_PORT production
vercel env add EMAIL_SERVER_USER production
vercel env add EMAIL_SERVER_PASSWORD production
vercel env add EMAIL_FROM production
vercel env add SENTRY_DSN production
# ... autres variables
```

**Ou via fichier .env.production.local:**

```bash
# Importez toutes les variables depuis un fichier
vercel env pull .env.production.local
```

#### 5. Déploiement production

```bash
# Deploy to production
vercel --prod
```

**Résultat:**
```
✓ Production deployment ready
  https://visioncrm-production.vercel.app
```

#### 6. Configuration du domaine custom

```bash
# Ajoutez votre domaine
vercel domains add app.visioncrm.com

# Vercel vous donnera les DNS records à configurer
```

**DNS Configuration:**
- Type: `CNAME`
- Name: `app`
- Value: `cname.vercel-dns.com`
- TTL: `3600`

#### 7. Vérification

```bash
# Testez le déploiement
curl https://app.visioncrm.com/api/health

# Output attendu:
# {"status":"ok","timestamp":"2026-01-XX..."}
```

---

### Option 2: Déploiement via interface web Vercel

#### 1. Import du projet

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Cliquez "Import Git Repository"
3. Sélectionnez votre repo GitHub: `visioncrm-new`
4. Cliquez "Import"

#### 2. Configuration du projet

**Framework Preset:** Next.js (détecté automatiquement)

**Root Directory:** `./` (racine)

**Build Command:**
```bash
prisma generate && next build
```

**Output Directory:** `.next` (par défaut)

**Install Command:**
```bash
pnpm install
```

#### 3. Variables d'environnement

Ajoutez toutes les variables dans l'interface:

**Environment:**
- [x] Production
- [ ] Preview
- [ ] Development

**Variables (minimum):**

```env
DATABASE_URL=postgresql://user:password@host:5432/visioncrm_prod
DIRECT_URL=postgresql://user:password@host:5432/visioncrm_prod?pgbouncer=true
NEXTAUTH_URL=https://app.visioncrm.com
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=noreply@visioncrm.com
EMAIL_SERVER_PASSWORD=your-smtp-password
EMAIL_FROM=VisionCRM <noreply@visioncrm.com>
SENTRY_DSN=https://xxx@sentry.io/xxx
NODE_ENV=production
```

#### 4. Déployer

Cliquez "Deploy" et attendez (2-3 minutes).

#### 5. Configuration du domaine

1. Project Settings → Domains
2. Add Domain: `app.visioncrm.com`
3. Configurez DNS selon instructions Vercel

#### 6. Configuration SSL

SSL est automatique avec Vercel (Let's Encrypt).

Vérifiez: [SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=app.visioncrm.com)

---

## 🐳 Déploiement sur AWS (Alternative)

### Option Docker + ECS

#### 1. Préparer le Dockerfile

Créez `Dockerfile.prod`:

```dockerfile
# Dockerfile.prod
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copy node_modules with Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Build l'image Docker

```bash
docker build -f Dockerfile.prod -t visioncrm:latest .
```

#### 3. Test local

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="test-secret" \
  visioncrm:latest
```

#### 4. Push vers ECR (AWS Container Registry)

```bash
# Authenticate
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com

# Tag image
docker tag visioncrm:latest YOUR_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/visioncrm:latest

# Push
docker push YOUR_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/visioncrm:latest
```

#### 5. Deploy sur ECS

Créez un Task Definition ECS avec:
- Image: `YOUR_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/visioncrm:latest`
- CPU: 512 (0.5 vCPU)
- Memory: 1024 MB
- Port mappings: 3000:3000
- Environment variables: Toutes les vars d'environnement

Créez un Service ECS:
- Cluster: visioncrm-production
- Service name: visioncrm-app
- Desired tasks: 2 (pour HA)
- Load balancer: ALB avec target group
- Health check: /api/health

---

## 🗄️ Configuration base de données

### Option 1: Supabase (Recommandé pour beta)

#### 1. Créer projet Supabase

1. [app.supabase.com](https://app.supabase.com)
2. New Project
3. Name: `visioncrm-production`
4. Database Password: Générez un mot de passe fort
5. Region: `Europe (Frankfurt)` ou plus proche

#### 2. Récupérer connection strings

**Project Settings → Database:**

```env
# Connection pooler (recommandé)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection
DIRECT_URL="postgresql://postgres.xxx:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

#### 3. Migrations Prisma

```bash
# Set environment variables
export DATABASE_URL="postgresql://..."
export DIRECT_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma db pull
```

#### 4. Seed data (si nécessaire)

```bash
# Optionnel: données initiales
npx prisma db seed
```

---

### Option 2: AWS RDS PostgreSQL

#### 1. Créer instance RDS

```bash
aws rds create-db-instance \
  --db-instance-identifier visioncrm-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --allocated-storage 20 \
  --master-username visioncrm \
  --master-user-password YOUR_STRONG_PASSWORD \
  --vpc-security-group-ids sg-xxx \
  --db-subnet-group-name visioncrm-subnet-group \
  --backup-retention-period 7 \
  --publicly-accessible false \
  --storage-encrypted \
  --multi-az true
```

#### 2. Configuration PgBouncer

Installez PgBouncer pour connection pooling (recommandé).

```ini
# pgbouncer.ini
[databases]
visioncrm = host=YOUR_RDS_ENDPOINT port=5432 dbname=postgres

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

#### 3. Connection strings

```env
DATABASE_URL="postgresql://visioncrm:PASSWORD@pgbouncer-host:6432/visioncrm?pgbouncer=true"
DIRECT_URL="postgresql://visioncrm:PASSWORD@rds-endpoint:5432/visioncrm"
```

---

## 📧 Configuration emails (SMTP)

### Option 1: SendGrid (Recommandé)

#### 1. Créer compte SendGrid

1. [sendgrid.com/pricing](https://sendgrid.com/pricing)
2. Plan Free (100 emails/jour) ou Essentials ($20/mois, 50k emails)

#### 2. Créer API Key

1. Settings → API Keys → Create API Key
2. Name: `VisionCRM Production`
3. Full Access
4. Copy API Key (affiché une seule fois)

#### 3. Variables d'environnement

```env
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=SG.xxxxx (votre API key)
EMAIL_FROM=VisionCRM <noreply@visioncrm.com>
```

#### 4. Sender Authentication

1. Settings → Sender Authentication
2. Domain Authentication
3. DNS records à ajouter:
   - CNAME: `em1234.visioncrm.com → u1234.wl.sendgrid.net`
   - CNAME: `s1._domainkey.visioncrm.com → s1.domainkey.u1234.wl.sendgrid.net`
   - CNAME: `s2._domainkey.visioncrm.com → s2.domainkey.u1234.wl.sendgrid.net`

#### 5. Test email

```bash
curl -X POST https://app.visioncrm.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

---

### Option 2: AWS SES

#### 1. Vérifier domaine

```bash
aws ses verify-domain-identity --domain visioncrm.com
```

#### 2. Ajouter DNS records

AWS vous donnera 3 TXT records à ajouter.

#### 3. Move out of sandbox

Requête auprès d'AWS pour sortir du sandbox (limite 200 emails/jour).

#### 4. Configuration

```env
EMAIL_SERVER_HOST=email-smtp.eu-west-1.amazonaws.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=AKIAIOSFODNN7EXAMPLE
EMAIL_SERVER_PASSWORD=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
EMAIL_FROM=VisionCRM <noreply@visioncrm.com>
```

---

## 🔐 Configuration SSL/TLS

### Vercel (automatique)

SSL géré automatiquement par Vercel (Let's Encrypt).

### AWS (manuel avec ACM)

#### 1. Request certificate

```bash
aws acm request-certificate \
  --domain-name app.visioncrm.com \
  --validation-method DNS \
  --region us-east-1
```

#### 2. Valider via DNS

AWS vous donne un CNAME record à ajouter.

#### 3. Attacher au Load Balancer

```bash
aws elbv2 add-listener-certificates \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --certificates CertificateArn=arn:aws:acm:...
```

---

## 📊 Configuration monitoring

### Sentry

#### 1. Créer projet Sentry

1. [sentry.io](https://sentry.io)
2. Create Project
3. Platform: Next.js
4. Name: VisionCRM Production

#### 2. Installation (déjà fait)

```bash
# Already in project
pnpm add @sentry/nextjs
```

#### 3. Configuration

```env
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=visioncrm-production
```

#### 4. Upload source maps

```bash
# Automatic on build if SENTRY_AUTH_TOKEN is set
pnpm run build

# Manual upload
sentry-cli sourcemaps upload --org your-org --project visioncrm-production .next
```

---

### Vercel Analytics (déjà intégré)

Analytics sont automatiques sur Vercel (Web Vitals, etc.).

Dashboard: Project → Analytics

---

## ✅ Vérifications post-déploiement

### 1. Sanity checks

```bash
# Health check
curl https://app.visioncrm.com/api/health
# Expected: {"status":"ok"}

# Homepage loads
curl -I https://app.visioncrm.com
# Expected: HTTP/2 200

# HTTPS redirect
curl -I http://app.visioncrm.com
# Expected: HTTP/1.1 308 → https://

# API route works
curl https://app.visioncrm.com/api/contacts
# Expected: 401 (unauthorized, but endpoint works)
```

### 2. Test complet utilisateur

1. **Signup:**
   - Allez sur `/register`
   - Créez un compte
   - Vérifiez email reçu
   - Confirmez email

2. **Login:**
   - Connectez-vous
   - Dashboard charge

3. **Create quote:**
   - Nouveau devis
   - Remplissez wizard
   - Vérifiez PDF généré

4. **Create invoice:**
   - Nouvelle facture
   - Vérifiez email envoyé

### 3. Performance

```bash
# Lighthouse
npx lighthouse https://app.visioncrm.com --view

# Check scores:
# - Performance: ≥ 90
# - Accessibility: ≥ 95
# - Best Practices: ≥ 95
# - SEO: ≥ 90
```

### 4. Sécurité

```bash
# SSL Labs
# https://www.ssllabs.com/ssltest/analyze.html?d=app.visioncrm.com
# Target: A ou A+

# Security Headers
# https://securityheaders.com/?q=app.visioncrm.com
# Target: A ou A+
```

### 5. Monitoring

- Ouvrez Sentry dashboard: pas d'erreurs
- Ouvrez Vercel Analytics: trafic visible
- Logs: pas d'erreurs critiques

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Création du workflow

Créez `.github/workflows/production.yml`:

```yaml
name: Production Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm run test

      - name: Run E2E tests
        run: pnpm exec playwright test

      - name: Build
        run: pnpm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Configuration secrets GitHub

1. GitHub → Repository → Settings → Secrets
2. Add secrets:
   - `VERCEL_TOKEN` (depuis Vercel account settings)
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

---

## 🚨 Rollback procedure

### Vercel rollback

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or via web interface:
# Project → Deployments → [previous deployment] → Promote to Production
```

### Database rollback

```bash
# If migration caused issues
npx prisma migrate resolve --rolled-back [migration_name]

# Restore from backup
pg_restore -h HOST -U USER -d DATABASE backup.sql
```

---

## 📞 Support et contacts

**En cas de problème:**

- **Technical Lead:** tech-lead@visioncrm.com
- **DevOps:** devops@visioncrm.com
- **On-call:** +33 X XX XX XX XX
- **Status page:** status.visioncrm.com

**Escalation:**
1. Level 1: Dev team
2. Level 2: CTO
3. Level 3: CEO (incidents critiques uniquement)

---

**Version:** 1.0
**Dernière mise à jour:** Janvier 2026

[← Retour à la checklist](./PRODUCTION_CHECKLIST.md)
