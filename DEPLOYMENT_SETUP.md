# 🚀 Deployment Setup - vision-crm.app

Guide de configuration pour le déploiement de VisionCRM sur `vision-crm.app` avec Resend.

## 📋 Configuration actuelle

- **Domaine principal:** `https://vision-crm.app`
- **Plateforme:** Vercel
- **Service Email:** Resend
- **Database:** [À configurer - Supabase recommandé]

---

## 1️⃣ Configuration DNS Resend

### Étape 1 : Créer compte Resend

1. Aller sur [resend.com/signup](https://resend.com/signup)
2. Créer un compte (gratuit: 3,000 emails/mois)
3. Aller dans **API Keys** → Créer une clé
4. Copier la clé (commence par `re_...`)

### Étape 2 : Ajouter le domaine dans Resend

1. Dans Resend Dashboard → **Domains**
2. Cliquer **Add Domain**
3. Entrer: `vision-crm.app`
4. Cliquer **Add**

### Étape 3 : Records DNS à ajouter dans Vercel

Resend va vous fournir 3 records. Voici le format standard :

#### Dans Vercel Dashboard → Domains → vision-crm.app → DNS Records

**Record 1 - SPF (TXT)**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

**Record 2 - DKIM (TXT)**
```
Type: TXT
Name: resend._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (fourni par Resend)
```
⚠️ **Important:** Copiez la valeur exacte depuis le dashboard Resend !

**Record 3 - Return-Path (CNAME) - Optionnel**
```
Type: CNAME
Name: em1234 (fourni par Resend)
Value: resend.net
```

### Étape 4 : Vérifier dans Resend

1. Attendre 5-10 minutes (propagation DNS)
2. Dans Resend → **Domains** → Cliquer **Verify**
3. Status doit passer à ✅ **Verified**

### Étape 5 : Ajouter DMARC (Recommandé)

Dans Vercel DNS, ajouter :

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@vision-crm.app; pct=100; adkim=s; aspf=s
```

---

## 2️⃣ Variables d'environnement Vercel

### Dans Vercel Dashboard → Settings → Environment Variables

Ajouter ces variables pour **Production**, **Preview**, et **Development** :

#### Variables Email (Resend)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="VisionCRM <noreply@vision-crm.app>"
EMAIL_REPLY_TO="support@vision-crm.app"
```

#### Variables NextAuth

```bash
NEXTAUTH_URL=https://vision-crm.app
NEXTAUTH_SECRET=[générer avec: openssl rand -base64 32]
```

#### Variables Database (Supabase recommandé)

```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/visioncrm
DIRECT_URL=postgresql://postgres:[password]@[host]:5432/visioncrm
```

#### Variables Monitoring (Optionnel)

```bash
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxxxxxxxxxx
```

### Commande pour générer NEXTAUTH_SECRET

```bash
# Dans terminal local
openssl rand -base64 32
# Copier le résultat dans NEXTAUTH_SECRET
```

---

## 3️⃣ GitHub Actions Setup

### Secrets GitHub à configurer

Dans GitHub → **Settings** → **Secrets and variables** → **Actions**

#### Secrets Vercel (obligatoires)

1. **VERCEL_TOKEN**
   - Aller sur [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Créer token: "GitHub Actions CI/CD"
   - Copier le token

2. **VERCEL_ORG_ID** & **VERCEL_PROJECT_ID**
   ```bash
   # Dans le terminal local (racine du projet)
   vercel link

   # Lire les IDs
   cat .vercel/project.json
   ```

   Output:
   ```json
   {
     "orgId": "team_xxxxxxxxxxxxx",
     "projectId": "prj_xxxxxxxxxxxxx"
   }
   ```

#### Secrets Staging (optionnel)

```bash
STAGING_DATABASE_URL=postgresql://...
STAGING_NEXTAUTH_SECRET=[32+ chars random]
STAGING_NEXTAUTH_URL=https://staging-vision-crm.vercel.app
```

---

## 4️⃣ Test Email Deliverability

### Script de test

Créer `scripts/test-email.ts` :

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    // 1. Aller sur https://www.mail-tester.com/
    // 2. Copier l'adresse email unique (ex: test-abc123@mail-tester.com)

    const testEmail = 'test-abc123@mail-tester.com'; // REMPLACER avec adresse mail-tester

    const { data, error } = await resend.emails.send({
      from: 'VisionCRM <noreply@vision-crm.app>',
      to: testEmail,
      subject: 'Test Email Deliverability - VisionCRM',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>VisionCRM Email Test</h1>
          <p>Ceci est un test de délivrabilité des emails.</p>
          <p>Si vous recevez cet email, la configuration SPF/DKIM fonctionne correctement.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">© 2026 VisionCRM. Tous droits réservés.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Erreur:', error);
      process.exit(1);
    }

    console.log('✅ Email envoyé avec succès!');
    console.log('📧 ID:', data?.id);
    console.log('\n📊 Maintenant:');
    console.log('1. Retournez sur mail-tester.com');
    console.log('2. Cliquez sur "Then check your score"');
    console.log('3. Vérifiez que le score est > 8/10');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testEmail();
```

### Exécution

```bash
# Installer Resend
pnpm add resend

# Ajouter dans .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Exécuter test
npx tsx scripts/test-email.ts
```

**Target:** Score > 8/10 sur mail-tester.com ✅

---

## 5️⃣ Load Test k6

### Script mis à jour pour vision-crm.app

Le fichier `tests/load/load-test.js` est déjà prêt. Il suffit de l'exécuter avec le bon domaine :

```bash
# Test staging Vercel
k6 run --env BASE_URL=https://vision-crm.vercel.app tests/load/load-test.js

# Test production (après go-live)
k6 run --env BASE_URL=https://vision-crm.app tests/load/load-test.js

# Test simple (pages publiques)
k6 run --env BASE_URL=https://vision-crm.app tests/load/load-test-simple.js
```

### Résultats attendus

```
✓ http_req_duration........: avg=250ms  p(95)=420ms  [PASS < 500ms]
✓ http_req_failed..........: 0.8%                     [PASS < 5%]
✓ http_reqs................: 12,543 (209/s)
✓ errors...................: 0.4%                     [PASS < 5%]
```

---

## 6️⃣ Lighthouse Audit

### Commande

```bash
# Via CLI
lighthouse https://vision-crm.app --output html --output-path ./lighthouse-report.html --view

# Desktop
lighthouse https://vision-crm.app --preset=desktop --output html --output-path ./lighthouse-desktop.html

# Mobile
lighthouse https://vision-crm.app --preset=mobile --output html --output-path ./lighthouse-mobile.html
```

### Via PageSpeed Insights

https://pagespeed.web.dev/?url=https://vision-crm.app

**Target:**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 90

---

## 7️⃣ Database Setup (Supabase recommandé)

### Option 1 : Supabase (Recommandé)

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un projet: "VisionCRM Production"
3. Region: Frankfurt (EU)
4. Password: [générer fort]
5. Attendre provisioning (2-3 min)

6. **Copier Connection String:**
   - Settings → Database → Connection string
   - Mode: Session (connection pooling)
   - Copier: `postgresql://postgres:[password]@[host]:5432/postgres`

7. **Ajouter dans Vercel:**
   ```bash
   DATABASE_URL=postgresql://postgres.[ref].supabase.co:5432/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.[ref].supabase.co:5432/postgres
   ```

8. **Lancer migrations:**
   ```bash
   # Dans terminal local
   pnpm prisma migrate deploy
   pnpm prisma db seed  # Si vous voulez seed data démo
   ```

### Option 2 : Vercel Postgres

1. Vercel Dashboard → Storage → Create Database → Postgres
2. Region: Washington, D.C. (iad1)
3. Créer database
4. Copier variables d'environnement automatiquement ajoutées

---

## 8️⃣ Monitoring Setup

### Sentry (Error Tracking)

1. Aller sur [sentry.io](https://sentry.io/signup/)
2. Créer projet: "VisionCRM"
3. Platform: Next.js
4. Copier DSN: `https://xxxxx@sentry.io/xxxxx`
5. Ajouter dans Vercel env vars:
   ```bash
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

### UptimeRobot (Uptime Monitoring)

1. Aller sur [uptimerobot.com](https://uptimerobot.com)
2. Create Monitor:
   - Type: HTTPS
   - URL: `https://vision-crm.app`
   - Name: "VisionCRM Production"
   - Interval: 5 minutes
3. Alert: Email à votre adresse

---

## ✅ Checklist Finale

### DNS & Email

- [ ] Domaine `vision-crm.app` actif sur Vercel
- [ ] SPF record ajouté dans Vercel DNS
- [ ] DKIM record ajouté (depuis Resend)
- [ ] DMARC record ajouté
- [ ] Resend domain vérifié (statut: Verified)
- [ ] Test email-tester.com score > 8/10

### Variables d'environnement

- [ ] `RESEND_API_KEY` configuré
- [ ] `EMAIL_FROM` configuré
- [ ] `NEXTAUTH_URL` = `https://vision-crm.app`
- [ ] `NEXTAUTH_SECRET` généré (32+ chars)
- [ ] `DATABASE_URL` configuré
- [ ] `DIRECT_URL` configuré

### GitHub Actions

- [ ] `VERCEL_TOKEN` secret ajouté
- [ ] `VERCEL_ORG_ID` secret ajouté
- [ ] `VERCEL_PROJECT_ID` secret ajouté
- [ ] Workflow testé (push vers `develop`)

### Database

- [ ] Supabase project créé
- [ ] Connection strings copiées
- [ ] Migrations déployées (`prisma migrate deploy`)
- [ ] Seed data ajoutée (optionnel)

### Monitoring

- [ ] Sentry projet créé
- [ ] `SENTRY_DSN` configuré
- [ ] UptimeRobot monitor créé
- [ ] Alerts email configurées

### Tests

- [ ] Load test k6 exécuté (p95 < 500ms)
- [ ] Lighthouse audit effectué (>90 all metrics)
- [ ] E2E tests passent en CI
- [ ] Security tests passent (22 tests)

### Déploiement

- [ ] Push vers `main` → Production deploy
- [ ] Site accessible: `https://vision-crm.app`
- [ ] HTTPS fonctionnel (certificat valide)
- [ ] Login fonctionne
- [ ] Emails envoyés correctement

---

## 🚀 Commandes de déploiement

```bash
# 1. Vérifier build local
pnpm run build

# 2. Push vers develop (staging)
git checkout -b develop
git push origin develop

# 3. Vérifier staging dans Vercel Dashboard

# 4. Si OK, merge vers main (production)
git checkout main
git merge develop
git push origin main

# 5. Vérifier production
curl https://vision-crm.app
```

---

## 📞 Support

**En cas de problème:**

1. **Build errors:** Vérifier logs Vercel Dashboard
2. **Database errors:** Vérifier connection strings Supabase
3. **Email errors:** Vérifier Resend logs + DNS records
4. **404 errors:** Vérifier domaine connecté dans Vercel

**Resources:**
- [Vercel Docs](https://vercel.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Version:** 1.0
**Date:** Janvier 2026
**Domaine:** vision-crm.app
