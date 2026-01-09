# 🔧 Guide de Configuration - Nouvelles Clés API

Suivez ces étapes dans l'ordre pour générer toutes vos nouvelles clés.

---

## 1️⃣ Gemini AI (Google)

### Créer une nouvelle clé

1. **Allez sur:** https://aistudio.google.com/app/apikey
2. Cliquez sur **"Create API key"**
3. Sélectionnez votre projet Google Cloud (ou créez-en un)
4. **Copiez la clé** qui commence par `AIza...`

### ✏️ Notez ici:
```
GEMINI_API_KEY="AIza_____________________________________________"
```

---

## 2️⃣ Stripe (Paiements)

### Clés API

1. **Allez sur:** https://dashboard.stripe.com/test/apikeys
2. Dans la section **"Secret key"**:
   - Cliquez sur **"Reveal test key"**
   - Cliquez sur **"Roll key"** pour générer une nouvelle clé
   - **Copiez** la nouvelle clé qui commence par `sk_test_...`

3. Dans la section **"Publishable key"**:
   - **Copiez** la clé qui commence par `pk_test_...`

### ✏️ Notez ici:
```
STRIPE_SECRET_KEY="sk_test__________________________________________"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test__________________________________________"
```

### Webhook Secret

1. **Allez sur:** https://dashboard.stripe.com/test/webhooks
2. Cliquez sur **"+ Add endpoint"**
3. **Pour l'instant, utilisez une URL temporaire:**
   ```
   Endpoint URL: https://httpbin.org/post
   ```
4. **Events to send:** Sélectionnez:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Cliquez sur **"Add endpoint"**
6. Cliquez sur le webhook créé
7. Cliquez sur **"Reveal"** dans la section **"Signing secret"**
8. **Copiez** le secret qui commence par `whsec_...`

### ✏️ Notez ici:
```
STRIPE_WEBHOOK_SECRET="whsec_________________________________________________"
```

**Note:** Vous mettrez à jour l'URL du webhook après le déploiement sur Vercel.

---

## 3️⃣ Resend (Email)

### Créer une nouvelle clé

1. **Allez sur:** https://resend.com/api-keys
2. Cliquez sur **"Create API Key"**
3. Donnez un nom: `VisionCRM Production`
4. Permission: **"Full Access"**
5. Cliquez sur **"Add"**
6. **Copiez** la clé qui commence par `re_...`

### ✏️ Notez ici:
```
RESEND_API_KEY="re_______________________________________________"
RESEND_FROM_EMAIL="VisionCRM <noreply@visioncrm.app>"
```

---

## 4️⃣ Supabase (Base de données)

### Réinitialiser le mot de passe

1. **Allez sur:** https://app.supabase.com/project/ieptwyxmjqfrtuiwauof/settings/database
2. Scrollez jusqu'à **"Database Password"**
3. Cliquez sur **"Reset database password"**
4. Confirmez avec **"I understand, reset the password"**
5. **Copiez** le nouveau mot de passe qui s'affiche

### Construire la nouvelle DATABASE_URL

Utilisez cette structure:
```
postgresql://postgres.ieptwyxmjqfrtuiwauof:VOTRE_NOUVEAU_MDP@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

### ✏️ Notez ici:
```
DATABASE_URL="postgresql://postgres.ieptwyxmjqfrtuiwauof:___________________@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

---

## 5️⃣ Google OAuth (Connexion sociale - Optionnel)

### Créer de nouveaux credentials

1. **Allez sur:** https://console.cloud.google.com/apis/credentials
2. Sélectionnez votre projet
3. Cliquez sur **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. Type d'application: **"Web application"**
5. Nom: `VisionCRM OAuth`
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   (Vous ajouterez l'URL de production après le déploiement)

7. Cliquez sur **"CREATE"**
8. **Copiez** le Client ID et Client Secret

### ✏️ Notez ici:
```
GOOGLE_CLIENT_ID="______________________________________.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-_____________________________"
```

---

## 6️⃣ NEXTAUTH_SECRET (Génération)

### Générer un nouveau secret

Ouvrez PowerShell et exécutez:
```powershell
# Méthode 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# OU Méthode 2: OpenSSL (si installé)
openssl rand -base64 32
```

### ✏️ Notez ici:
```
NEXTAUTH_SECRET="_________________________________________________"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 7️⃣ Mise à jour du fichier .env

Une fois que vous avez toutes vos clés, ouvrez votre fichier `.env`:

```bash
notepad .env
```

Et collez cette configuration avec VOS clés:

```env
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL="postgresql://postgres.ieptwyxmjqfrtuiwauof:VOTRE_NOUVEAU_MDP@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# ============================================================================
# AUTHENTICATION
# ============================================================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="VOTRE_SECRET_GENERE"

# ============================================================================
# GOOGLE OAUTH (Optionnel)
# ============================================================================
GOOGLE_CLIENT_ID="VOTRE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-VOTRE_CLIENT_SECRET"

# ============================================================================
# AI - GEMINI
# ============================================================================
GEMINI_API_KEY="VOTRE_NOUVELLE_CLE_GEMINI"

# ============================================================================
# PAYMENTS - STRIPE
# ============================================================================
STRIPE_SECRET_KEY="VOTRE_STRIPE_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="VOTRE_WEBHOOK_SECRET"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="VOTRE_PUBLISHABLE_KEY"

# ============================================================================
# EMAIL - RESEND
# ============================================================================
RESEND_API_KEY="VOTRE_RESEND_API_KEY"
RESEND_FROM_EMAIL="VisionCRM <noreply@visioncrm.app>"

# ============================================================================
# FEATURE FLAGS
# ============================================================================
NEXT_PUBLIC_ENABLE_AI_ASSISTANT="true"
NEXT_PUBLIC_ENABLE_OCR="false"
NEXT_PUBLIC_ENABLE_WHATSAPP="false"
NEXT_PUBLIC_MAINTENANCE_MODE="false"

# ============================================================================
# DEVELOPMENT
# ============================================================================
NODE_ENV="development"
LOG_LEVEL="debug"
```

---

## 8️⃣ Tester votre configuration

Une fois que vous avez mis à jour votre `.env`:

```bash
# Vérifier que les variables sont bien configurées
pnpm verify:env

# Lancer le serveur de développement
pnpm dev
```

Ouvrez http://localhost:3000 et testez:
- ✅ La page d'accueil charge
- ✅ Vous pouvez vous inscrire
- ✅ Vous recevez l'email de vérification

---

## ✅ Checklist finale

- [ ] Nouvelle clé Gemini générée et notée
- [ ] Nouvelles clés Stripe générées et notées
- [ ] Nouvelle clé Resend générée et notée
- [ ] Mot de passe Supabase réinitialisé et DATABASE_URL construite
- [ ] Nouveaux credentials Google OAuth créés (optionnel)
- [ ] NEXTAUTH_SECRET généré
- [ ] Fichier `.env` mis à jour avec toutes les nouvelles clés
- [ ] `pnpm verify:env` exécuté avec succès
- [ ] `pnpm dev` fonctionne sans erreur

---

## 🚀 Prochaine étape: Déploiement sur Vercel

Une fois que tout fonctionne en local, vous pourrez déployer sur Vercel et configurer les mêmes variables d'environnement dans le dashboard Vercel.

**Date:** 2026-01-07
**Étape:** Configuration après révocation des clés
