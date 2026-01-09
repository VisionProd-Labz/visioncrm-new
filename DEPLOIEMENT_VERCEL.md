# 🚀 Déploiement sur Vercel - Guide Complet

Votre application est prête à être déployée sur Vercel !

---

## ✅ Pré-requis (Déjà fait)

- [x] Code poussé sur GitHub: https://github.com/VisionProd-Labz/visioncrm
- [x] Toutes les clés API révoquées et régénérées
- [x] Application testée en local et fonctionne parfaitement
- [x] Fichier `.env` avec nouvelles clés configuré

---

## 🌐 Étape 1: Créer un compte Vercel

Si vous n'avez pas encore de compte Vercel:

1. Allez sur: **https://vercel.com/signup**
2. Cliquez sur **"Continue with GitHub"**
3. Autorisez Vercel à accéder à vos dépôts GitHub

---

## 📦 Étape 2: Importer votre projet

1. **Allez sur:** https://vercel.com/new

2. **Sélectionnez GitHub** comme source

3. **Cherchez** votre dépôt: `VisionProd-Labz/visioncrm`

4. Cliquez sur **"Import"**

---

## ⚙️ Étape 3: Configurer les variables d'environnement

**IMPORTANT:** Avant de déployer, configurez TOUTES vos variables d'environnement.

### Dans l'interface de Vercel:

Copiez-collez ces variables une par une (avec VOS vraies valeurs):

#### DATABASE (1 variable)
```
DATABASE_URL
postgresql://postgres.ieptwyxmjqfrtuiwauof:VOTRE_NOUVEAU_MDP@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

#### AUTHENTICATION (2 variables)
```
NEXTAUTH_URL
https://votre-projet.vercel.app (vous mettrez à jour après le déploiement)

NEXTAUTH_SECRET
Re/Ne28Hr0qlQ8a4dU6I/1dv1tTRAEvcM28c6lkRgNg=
```

#### GOOGLE OAUTH (2 variables - Optionnel)
```
GOOGLE_CLIENT_ID
464893926984-9bvi2qu5je2dunls7f069nfmruajdpqt.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET
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
```

#### GEMINI AI (1 variable)
```
GEMINI_API_KEY
AIzaSyBKBzAHGcxiNLRgPL5tmAmDe6hU3XtUsas
```

#### STRIPE (3 variables)
```
STRIPE_SECRET_KEY
sk_test_51SjdeZAIcytR1oWWsImrs5mxhmGyzD235rSj4yIUuqh1KosPIv9TqLFVTIgEqqJNXHFiQoy5AO6CstDuGtDeF3ED002yr59rXp

STRIPE_WEBHOOK_SECRET
whsec_4c21cc51ad9abb3daad650533940f4e31b61b77b32cdd0a161b2234a628bb278

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
pk_test_51SjdeZAIcytR1oWWT2hgstPRhzMLMTvRxx1TuIUUPRuhcAAo3o8qKK8yj32yS4GZeCqTVvT3blwAL2OL44rCLJVC00qDY4jYRa
```

#### RESEND EMAIL (2 variables)
```
RESEND_API_KEY
re_jVg4A4P1_AcV9Q24CtLToJwAHmWcn5ZhG

RESEND_FROM_EMAIL
VisionCRM <noreply@visioncrm.app>
```

#### FEATURE FLAGS (4 variables)
```
NEXT_PUBLIC_ENABLE_AI_ASSISTANT
true

NEXT_PUBLIC_ENABLE_OCR
false

NEXT_PUBLIC_ENABLE_WHATSAPP
false

NEXT_PUBLIC_MAINTENANCE_MODE
false
```

#### ENVIRONMENT (1 variable)
```
NODE_ENV
production
```

### Comment ajouter les variables dans Vercel:

1. Dans l'interface de configuration du projet
2. Section **"Environment Variables"**
3. Pour chaque variable:
   - **Key:** Nom de la variable (ex: `DATABASE_URL`)
   - **Value:** La valeur (copiez depuis votre `.env`)
   - **Environment:** Cochez **"Production"**, **"Preview"**, et **"Development"**
4. Cliquez sur **"Add"**

**💡 Astuce:** Vous pouvez aussi coller tout votre fichier `.env` d'un coup:
- Cliquez sur le petit lien "Paste .env"
- Collez tout le contenu de votre fichier `.env`
- Vercel importera toutes les variables automatiquement

---

## 🚀 Étape 4: Déployer

1. Une fois toutes les variables configurées
2. Cliquez sur **"Deploy"**
3. Attendez 2-3 minutes pendant le build
4. Votre application sera live à: `https://visioncrm.vercel.app` (ou un nom similaire)

---

## 🔄 Étape 5: Configuration post-déploiement

### A. Mettre à jour NEXTAUTH_URL

1. Notez votre URL Vercel (ex: `https://visioncrm-abc123.vercel.app`)
2. Dans Vercel Dashboard → Votre Projet → **Settings** → **Environment Variables**
3. Trouvez `NEXTAUTH_URL`
4. Cliquez sur les **3 points** → **Edit**
5. Changez de `http://localhost:3000` vers votre vraie URL Vercel
6. Cliquez sur **"Save"**
7. **Redéployez:** Vercel Dashboard → **Deployments** → **Redeploy**

### B. Mettre à jour le Webhook Stripe

1. Allez sur: https://dashboard.stripe.com/test/webhooks
2. Trouvez le webhook que vous avez créé
3. Cliquez dessus → **Edit**
4. **Endpoint URL:** Changez vers:
   ```
   https://VOTRE-URL-VERCEL.vercel.app/api/webhooks/stripe
   ```
5. Cliquez sur **"Update endpoint"**

### C. Mettre à jour les Redirect URIs OAuth (si configuré)

1. Allez sur: https://console.cloud.google.com/apis/credentials
2. Cliquez sur votre OAuth Client
3. **Authorized redirect URIs:** Ajoutez:
   ```
   https://VOTRE-URL-VERCEL.vercel.app/api/auth/callback/google
   ```
4. Cliquez sur **"Save"**

---

## 🧪 Étape 6: Tester votre application en production

1. **Ouvrez votre URL Vercel** dans un navigateur

2. **Testez l'inscription:**
   - Cliquez sur "S'inscrire"
   - Créez un nouveau compte
   - Vérifiez que vous recevez l'email de vérification

3. **Testez la connexion:**
   - Vérifiez votre email
   - Cliquez sur le lien de vérification
   - Connectez-vous

4. **Testez les fonctionnalités:**
   - Dashboard charge correctement
   - Vous pouvez créer des contacts
   - L'assistant AI fonctionne (si activé)

---

## 🎨 Étape 7: Ajouter un domaine personnalisé (Optionnel)

Si vous voulez utiliser votre propre domaine (ex: `app.visioncrm.com`):

1. Vercel Dashboard → Votre Projet → **Settings** → **Domains**
2. Cliquez sur **"Add"**
3. Entrez votre domaine
4. Suivez les instructions pour configurer vos DNS

**Puis mettez à jour:**
- `NEXTAUTH_URL` dans Vercel
- Webhook Stripe
- OAuth Redirect URIs

---

## ✅ Checklist finale de déploiement

- [ ] Compte Vercel créé et lié à GitHub
- [ ] Projet importé depuis GitHub
- [ ] Toutes les variables d'environnement configurées (16 variables minimum)
- [ ] Premier déploiement réussi
- [ ] NEXTAUTH_URL mis à jour avec l'URL Vercel
- [ ] Webhook Stripe mis à jour avec l'URL Vercel
- [ ] OAuth Redirect URIs mis à jour (si configuré)
- [ ] Application testée en production
- [ ] Inscription + email fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard accessible

---

## 🆘 Dépannage

### Le build échoue
- Vérifiez les logs de build dans Vercel
- Assurez-vous que toutes les variables d'environnement sont configurées

### Erreur "Invalid NEXTAUTH_URL"
- Vérifiez que NEXTAUTH_URL correspond exactement à votre URL Vercel
- Redéployez après avoir mis à jour

### Les emails ne sont pas envoyés
- Vérifiez que RESEND_API_KEY est correcte
- Vérifiez que RESEND_FROM_EMAIL est un email vérifié dans Resend

### Erreur de connexion à la base de données
- Vérifiez que DATABASE_URL est correcte
- Assurez-vous que le mot de passe Supabase est à jour

### Webhook Stripe ne fonctionne pas
- Vérifiez que l'URL du webhook pointe vers votre URL Vercel
- Vérifiez que STRIPE_WEBHOOK_SECRET correspond

---

## 📚 Ressources

- **Documentation Vercel:** https://vercel.com/docs
- **Dashboard Vercel:** https://vercel.com/dashboard
- **Support Vercel:** https://vercel.com/support

---

## 🎉 Félicitations !

Une fois toutes ces étapes complétées, votre application VisionCRM sera:
- ✅ Déployée en production sur Vercel
- ✅ Sécurisée avec des clés API régénérées
- ✅ Accessible à vos utilisateurs
- ✅ Prête à être utilisée

**URL de votre application:** `https://visioncrm-xyz.vercel.app`

---

**Date:** 2026-01-07
**Étape:** Déploiement sur Vercel
