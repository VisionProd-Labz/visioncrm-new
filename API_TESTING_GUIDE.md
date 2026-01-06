# VisionCRM - API Testing Guide

Guide complet pour tester toutes les intégrations API de VisionCRM.

**Date:** 2026-01-06
**Version:** 1.0.0

---

## 📋 Vue d'ensemble

Ce guide vous aide à tester toutes les intégrations API externes utilisées par VisionCRM:

- ✅ **Database** (PostgreSQL/Supabase) - REQUIRED
- ✅ **Resend** (Email service) - REQUIRED
- ✅ **Stripe** (Payments) - REQUIRED
- 🟡 **Google Vision** (OCR) - OPTIONAL
- 🟡 **Google Gemini** (AI) - OPTIONAL
- 🟡 **Upstash Redis** (Rate limiting) - OPTIONAL

---

## 🔍 Quick Test - All Services

Pour tester rapidement toutes les intégrations:

```bash
# Vérifier les variables d'environnement
pnpm verify:env

# Tester les connexions API
pnpm test:integrations

# Tout en un
pnpm verify:all
```

**Sortie attendue:**
```
✓ All required environment variables are configured!
🚀 Ready for production!

✓ Database connection successful
✓ Resend API connected (X domains configured)
✓ Stripe API connected (Account: acct_xxx)
ℹ Gemini not configured (optional)
ℹ Redis not configured (optional)

Required Services: 3/3 passed
🚀 Ready for production!
```

---

## 📧 1. Resend Email Service (REQUIRED)

### Configuration

Dans `.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Optional
```

### Test de connexion basique

```bash
pnpm test:integrations
```

Vérifie que la clé API est valide et récupère les domaines configurés.

### Test d'envoi d'email réel

Pour tester l'envoi réel d'un email:

```bash
pnpm test:resend your@email.com
```

**Exemple:**
```bash
pnpm test:resend john.doe@example.com
```

**Sortie attendue:**
```
📧 VisionCRM - Resend Email Test
=================================

ℹ Testing Resend integration...
ℹ Sending test email to: john.doe@example.com
ℹ From: noreply@yourdomain.com
✓ Email sent successfully!
ℹ   Email ID: re_abc123xyz
ℹ   Check your inbox at: john.doe@example.com

✓ Resend integration test passed!
🎉 Email service is working correctly!

Next steps:
1. Check your inbox (and spam folder)
2. Verify the email looks correct
3. If using a custom domain, ensure it's verified in Resend dashboard
```

### Troubleshooting

**Erreur 403 (Forbidden):**
- La clé API est invalide
- Le domaine n'est pas vérifié dans Resend
- Solution: Utiliser `onboarding@resend.dev` pour les tests

**Erreur 422 (Unprocessable Entity):**
- Format d'email invalide
- Le domaine from n'est pas vérifié
- Solution: Vérifier le domaine dans Resend dashboard

**Email non reçu:**
1. Vérifier le dossier spam
2. Vérifier que le domaine est vérifié
3. Tester avec `onboarding@resend.dev`

### Documentation Resend

- Dashboard: https://resend.com/domains
- API Docs: https://resend.com/docs/api-reference/emails/send-email

---

## 💳 2. Stripe Payment Service (REQUIRED)

### Configuration

Dans `.env`:
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx  # or sk_live_xxx for prod
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Test de connexion

```bash
pnpm test:integrations
```

Vérifie que la clé secrète est valide et récupère les infos du compte.

**Sortie attendue:**
```
✓ Stripe API connected (Account: acct_1234567890)
ℹ   Mode: TEST
```

### Test des webhooks

**1. Installer Stripe CLI:**
```bash
# Windows (via Scoop)
scoop install stripe

# MacOS (via Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

**2. Login:**
```bash
stripe login
```

**3. Forward webhooks to local dev:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**4. Trigger test events:**

```bash
# Test checkout session
stripe trigger checkout.session.completed

# Test subscription created
stripe trigger customer.subscription.created

# Test subscription updated
stripe trigger customer.subscription.updated

# Test subscription deleted
stripe trigger customer.subscription.deleted

# Test payment succeeded
stripe trigger invoice.payment_succeeded

# Test payment failed
stripe trigger invoice.payment_failed
```

**5. Vérifier les logs:**

Les webhooks doivent apparaître dans votre terminal avec:
- `✓` Événement reçu
- `✓` Signature vérifiée
- `✓` Traité avec succès

### Troubleshooting

**Webhook signature failed:**
- Le `STRIPE_WEBHOOK_SECRET` est incorrect
- Copier le secret depuis `stripe listen` output
- Format: `whsec_xxxxxxxxxxxxx`

**401 Unauthorized:**
- La clé secrète `STRIPE_SECRET_KEY` est invalide
- Vérifier dans Stripe Dashboard > Developers > API keys

**Mode mismatch:**
- Test keys (`sk_test_`) vs Live keys (`sk_live_`)
- Ne JAMAIS utiliser live keys en développement

### Documentation Stripe

- Dashboard: https://dashboard.stripe.com
- Webhooks: https://dashboard.stripe.com/webhooks
- CLI Docs: https://stripe.com/docs/stripe-cli
- Testing: https://stripe.com/docs/testing

---

## 🗄️ 3. Database (REQUIRED)

### Configuration

Dans `.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
```

### Test de connexion

```bash
pnpm test:integrations
```

**Sortie attendue:**
```
✓ Database connection successful
```

### Test manuel avec Prisma

```bash
# Ouvrir Prisma Studio
pnpm prisma:studio

# Appliquer les migrations
pnpm prisma:migrate

# Générer le client
pnpm prisma:generate
```

### Troubleshooting

**Connection refused:**
- Vérifier que la base de données est démarrée
- Vérifier l'URL de connexion
- Vérifier les credentials

**SSL error:**
- Ajouter `?sslmode=require` à la fin de DATABASE_URL
- Pour Supabase: Utiliser l'URL de pooling

**Migrations failed:**
- Vérifier que le schéma database existe
- Réinitialiser: `pnpm prisma migrate reset`

---

## 👁️ 4. Google Cloud Vision OCR (OPTIONAL)

### Configuration

Dans `.env`:
```env
GOOGLE_CLOUD_VISION_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_CLOUD_PROJECT_ID=your-project-id  # Optional
```

### Test de configuration

```bash
pnpm test:vision
```

**Sans image (check configuration):**
```
ℹ No image provided - checking if Vision is configured...
⚠ Google Cloud Vision not configured (optional)

Note: Google Cloud Vision is optional for VisionCRM.
The app will work without it, but OCR features will be disabled.
```

**Avec image (test OCR):**
```bash
pnpm test:vision path/to/invoice.pdf
pnpm test:vision path/to/document.png
```

**Sortie attendue:**
```
📄 VisionCRM - Google Vision OCR Test
=====================================

ℹ Testing OCR on: invoice.pdf
ℹ Sending request to Google Cloud Vision API...
✓ OCR completed successfully!
ℹ   Detected 25 text regions

Detected Text:
────────────────────────────────────────────────────────────
FACTURE

Date: 2026-01-06
Numéro: INV-2026-001

Client: John Doe
Adresse: 123 Rue Example, Paris

Description          Quantité    Prix
────────────────────────────────────
Service A                1      100.00 €
Service B                2      150.00 €
                              ─────────
Total TTC                      400.00 €
────────────────────────────────────────────────────────────

✓ Google Vision OCR test passed!
🎉 OCR functionality is working correctly!
```

### Troubleshooting

**400 Bad Request:**
- API key invalide
- Format d'image non supporté
- Image trop grande (max 20MB)

**403 Forbidden:**
- API key invalide ou expiré
- Cloud Vision API non activée
- Quota dépassé

**No text detected:**
- L'image ne contient pas de texte
- Texte trop petit ou flou
- Format de document non supporté

### Obtenir une clé API

1. Aller sur https://console.cloud.google.com
2. Créer un projet ou sélectionner un projet existant
3. Activer l'API Cloud Vision
4. Créer une clé API (Credentials > Create Credentials > API Key)
5. Copier la clé dans `.env`

### Documentation Google Vision

- Console: https://console.cloud.google.com
- API Docs: https://cloud.google.com/vision/docs
- Pricing: https://cloud.google.com/vision/pricing

---

## 🤖 5. Google Gemini AI (OPTIONAL)

### Configuration

Dans `.env`:
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX
```

### Test

```bash
pnpm test:integrations
```

**Note:** Le modèle `gemini-pro` est déprécié. Mettre à jour vers:
- `gemini-1.5-pro` - Modèle pro avec context long
- `gemini-1.5-flash` - Modèle rapide
- `gemini-2.0-flash-exp` - Dernière version expérimentale

### Fix pour l'erreur 404

Modifier `scripts/test-integrations.ts` ligne 145:

```typescript
// Avant
`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`

// Après
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
```

### Documentation Gemini

- API Docs: https://ai.google.dev/docs
- Get API Key: https://makersuite.google.com/app/apikey
- Pricing: https://ai.google.dev/pricing

---

## ⚡ 6. Upstash Redis (OPTIONAL)

### Configuration

Dans `.env`:
```env
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxNg
```

### Test

```bash
pnpm test:integrations
```

**Sortie attendue:**
```
✓ Redis connection successful
```

### Fallback

Si Redis n'est pas configuré, le rate limiting utilise une solution en mémoire (moins robuste mais fonctionnelle pour le dev).

### Obtenir Redis gratuit

1. Aller sur https://upstash.com
2. Créer un compte (gratuit)
3. Créer une base Redis
4. Copier REST URL et Token
5. Ajouter dans `.env`

**Limites gratuites:**
- 10,000 commandes/jour
- Suffisant pour 1000+ requêtes avec rate limiting

### Documentation Upstash

- Console: https://console.upstash.com
- Docs: https://upstash.com/docs/redis
- Pricing: https://upstash.com/pricing

---

## ✅ Checklist Complète

### Services Requis (Bloquants)

- [ ] **Database**
  - [ ] Variable `DATABASE_URL` configurée
  - [ ] Connection test passe
  - [ ] Migrations appliquées
  - [ ] Prisma Studio accessible

- [ ] **Resend Email**
  - [ ] Variable `RESEND_API_KEY` configurée
  - [ ] Connection test passe
  - [ ] Email de test envoyé et reçu
  - [ ] Domaine vérifié (si custom)

- [ ] **Stripe Payments**
  - [ ] Variables `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurées
  - [ ] Connection test passe
  - [ ] Stripe CLI installé
  - [ ] Webhooks testés localement
  - [ ] Events reçus et traités correctement

### Services Optionnels (Non-bloquants)

- [ ] **Google Cloud Vision**
  - [ ] Variable `GOOGLE_CLOUD_VISION_KEY` configurée
  - [ ] OCR test avec document passe
  - [ ] Texte correctement détecté

- [ ] **Google Gemini AI**
  - [ ] Variable `GEMINI_API_KEY` configurée
  - [ ] Modèle mis à jour (`gemini-1.5-flash`)
  - [ ] Test API passe

- [ ] **Upstash Redis**
  - [ ] Variables `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` configurées
  - [ ] Connection test passe
  - [ ] Rate limiting fonctionne

---

## 🚀 Scripts NPM Disponibles

```bash
# Vérification environment
pnpm verify:env              # Check toutes les variables
pnpm verify:env:detailed     # Avec détails complets

# Tests d'intégration
pnpm test:integrations       # Test tous les services
pnpm test:resend your@email  # Test email Resend
pnpm test:vision image.jpg   # Test OCR Vision

# Tout en un
pnpm verify:all              # Env + Integrations

# Tests unitaires
pnpm test                    # Run tests (48 tests)
pnpm test:coverage           # Avec coverage (27%)

# Base de données
pnpm prisma:studio           # Ouvrir interface
pnpm prisma:migrate          # Appliquer migrations
pnpm prisma:generate         # Générer client
```

---

## 📊 Status Attendu (Production Ready)

Après tous les tests, vous devriez voir:

```
✅ Environment Variables: 7/7 required configured
✅ Database: Connected
✅ Resend: Email sent successfully
✅ Stripe: Account connected (TEST mode)
🟡 Gemini: Not configured (optional)
🟡 Redis: Not configured (optional)
🟡 Vision: Not configured (optional)

🚀 Ready for production!
```

**Minimum requis pour la production:**
- 3/3 services required passing (Database, Resend, Stripe)
- 48/48 tests passing
- Webhooks Stripe testés et fonctionnels

---

## 🆘 Support

### Problèmes communs

**"Command not found: pnpm"**
```bash
npm install -g pnpm
```

**"Cannot find module @prisma/client"**
```bash
pnpm prisma:generate
```

**"Port 3000 already in use"**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

**"Environment variable not found"**
- Vérifier que `.env` existe
- Redémarrer le serveur après modification `.env`
- Vérifier les noms des variables (case-sensitive)

### Logs utiles

```bash
# Voir les logs Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Voir les logs database
pnpm prisma:studio

# Voir les logs du serveur
pnpm dev
```

---

**Dernière mise à jour:** 2026-01-06
**Prochain review:** Après déploiement production
