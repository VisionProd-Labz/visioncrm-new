# 🚨 SÉCURITÉ - Actions Urgentes

## Clés API compromises détectées par Google

Vos clés API ont été exposées publiquement sur GitHub. Vous devez les révoquer IMMÉDIATEMENT.

## ✅ Checklist de sécurité

### 1. Révoquer la clé Gemini (PRIORITÉ ABSOLUE)
- [ ] Aller sur: https://aistudio.google.com/app/apikey
- [ ] Supprimer la clé: `AIzaSyCfQqB1vDW7vfZPayODmqMeDJDXjCpoaAY`
- [ ] Créer une nouvelle clé
- [ ] Noter la nouvelle clé

### 2. Révoquer Google OAuth
- [ ] Aller sur: https://console.cloud.google.com/apis/credentials
- [ ] Supprimer ou régénérer les credentials OAuth compromis
- [ ] Créer de nouveaux credentials
- [ ] Noter Client ID et Client Secret

### 3. Regénérer les clés Stripe
- [ ] Aller sur: https://dashboard.stripe.com/test/apikeys
- [ ] Cliquer sur "Roll key" pour la Secret Key
- [ ] Noter la nouvelle Secret Key
- [ ] Aller sur: https://dashboard.stripe.com/test/webhooks
- [ ] Recréer le webhook avec votre URL de production
- [ ] Noter le nouveau Webhook Secret

### 4. Regénérer la clé Resend
- [ ] Aller sur: https://resend.com/api-keys
- [ ] Supprimer la clé: `re_3H8DTg8S_64Gcdwnm8ZTnXMv3Y3NTVUkA`
- [ ] Créer une nouvelle clé
- [ ] Noter la nouvelle clé

### 5. Changer le mot de passe Supabase
- [ ] Aller sur: https://app.supabase.com/project/ieptwyxmjqfrtuiwauof/settings/database
- [ ] Cliquer sur "Reset Database Password"
- [ ] Noter le nouveau mot de passe
- [ ] Copier la nouvelle DATABASE_URL complète

### 6. Mettre à jour votre fichier .env local

Ouvrez votre fichier `.env` et remplacez TOUTES les clés:

```bash
# DATABASE
DATABASE_URL="postgresql://postgres.NOUVEAU_MDP@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# AUTH
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="générer-nouveau-avec-openssl-rand-base64-32"

# GOOGLE OAUTH (nouvelles clés)
GOOGLE_CLIENT_ID="NOUVELLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="NOUVEAU_CLIENT_SECRET"

# GEMINI (nouvelle clé)
GEMINI_API_KEY="NOUVELLE_CLE_GEMINI"

# STRIPE (nouvelles clés)
STRIPE_SECRET_KEY="NOUVELLE_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="NOUVEAU_WEBHOOK_SECRET"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="NOUVELLE_PUBLISHABLE_KEY"

# RESEND (nouvelle clé)
RESEND_API_KEY="NOUVELLE_CLE_RESEND"
RESEND_FROM_EMAIL="VisionCRM <noreply@visioncrm.app>"
```

### 7. Quand vous déployez sur Vercel

Vous configurerez ces MÊMES variables dans Vercel:
1. Allez sur: https://vercel.com/new
2. Importez votre projet GitHub
3. Dans "Environment Variables", ajoutez TOUTES les variables ci-dessus
4. Déployez

## ⚠️ IMPORTANT

- ✅ Les variables d'environnement vont dans VERCEL (pas dans Supabase)
- ✅ Supabase = juste la base de données (vous y changez juste le mot de passe)
- ✅ Le fichier `.env` est pour votre développement LOCAL uniquement
- ❌ NE JAMAIS committer le fichier `.env`
- ❌ NE JAMAIS mettre de vraies clés dans `.env.example`

## 🔒 Génération de nouvelles clés

### NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## 📞 Support

Si vous avez des questions:
- Gemini: https://aistudio.google.com/
- Stripe: https://support.stripe.com/
- Resend: https://resend.com/support
- Supabase: https://supabase.com/support

---

**Date:** 2026-01-07
**Incident:** Clés API exposées sur GitHub
**Action:** Révocation et regénération de toutes les clés
