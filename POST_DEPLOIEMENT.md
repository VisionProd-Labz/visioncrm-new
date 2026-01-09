# 🔧 Configuration Post-Déploiement

**URL de votre application:** https://visioncrm-new.vercel.app

---

## 1️⃣ Mettre à jour NEXTAUTH_URL dans Vercel (2 min)

### Étapes:

1. **Allez sur:** https://vercel.com/visionprod-labz/visioncrm-new/settings/environment-variables

2. **Trouvez la variable** `NEXTAUTH_URL`

3. **Cliquez sur les 3 points** (⋮) à droite de la variable

4. **Cliquez sur "Edit"**

5. **Changez la valeur de:**
   ```
   http://localhost:3000
   ```
   **Vers:**
   ```
   https://visioncrm-new.vercel.app
   ```

6. **Sélectionnez** tous les environnements:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

7. **Cliquez sur "Save"**

8. **Redéployez l'application:**
   - Allez sur: https://vercel.com/visionprod-labz/visioncrm-new
   - Onglet **"Deployments"**
   - Trouvez le dernier déploiement
   - Cliquez sur les **3 points** (⋮)
   - Cliquez sur **"Redeploy"**
   - Cochez **"Use existing build cache"**
   - Cliquez sur **"Redeploy"**

✅ **Status:** NEXTAUTH_URL mis à jour

---

## 2️⃣ Configurer le Webhook Stripe (2 min)

### Étapes:

1. **Allez sur:** https://dashboard.stripe.com/test/webhooks

2. **Trouvez le webhook** que vous avez créé (celui avec l'URL temporaire `httpbin.org`)

3. **Cliquez dessus** pour l'ouvrir

4. **Cliquez sur** le bouton **"..."** (en haut à droite) puis **"Update details"**

5. **Endpoint URL:** Changez vers:
   ```
   https://visioncrm-new.vercel.app/api/webhooks/stripe
   ```

6. **Events to send:** Assurez-vous que ces événements sont sélectionnés:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

7. **Cliquez sur "Update endpoint"**

8. **Testez le webhook:**
   - Sur la page du webhook, cliquez sur **"Send test webhook"**
   - Sélectionnez `checkout.session.completed`
   - Cliquez sur **"Send test webhook"**
   - Vous devriez voir un statut ✅ **200 OK**

✅ **Status:** Webhook Stripe configuré et testé

---

## 3️⃣ Mettre à jour les OAuth Redirect URIs Google (2 min)

### Étapes:

1. **Allez sur:** https://console.cloud.google.com/apis/credentials

2. **Sélectionnez votre projet** dans le menu déroulant en haut

3. **Trouvez votre OAuth 2.0 Client ID** (celui que vous avez créé récemment)
   - Devrait commencer par: `464893926984-9bvi2qu5je2dunls7f069nfmruajdpqt`

4. **Cliquez dessus** pour l'éditer

5. **Authorized redirect URIs:** Ajoutez ces deux URLs:

   **Pour l'authentification sociale (NextAuth):**
   ```
   https://visioncrm-new.vercel.app/api/auth/callback/google
   ```

   **Pour Gmail API (optionnel):**
   ```
   https://visioncrm-new.vercel.app/api/email/oauth/gmail/callback
   ```

6. **Gardez aussi l'URL localhost** pour le développement:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

7. **Cliquez sur "Save"**

✅ **Status:** OAuth Redirect URIs mis à jour

---

## 4️⃣ Vérifier le domaine Resend (Optionnel mais recommandé)

Si vous voulez envoyer des emails depuis `noreply@visioncrm.app`, vous devez vérifier le domaine.

### Option A: Utiliser l'email par défaut Resend (temporaire)

1. **Allez dans Vercel:**
   - https://vercel.com/visionprod-labz/visioncrm-new/settings/environment-variables

2. **Modifiez** `RESEND_FROM_EMAIL`:
   ```
   VisionCRM <onboarding@resend.dev>
   ```

3. **Sauvegardez et redéployez**

### Option B: Vérifier votre domaine (production)

1. **Allez sur:** https://resend.com/domains

2. **Cliquez sur "Add Domain"**

3. **Entrez:** `visioncrm.app`

4. **Suivez les instructions** pour ajouter les enregistrements DNS

5. **Une fois vérifié**, vous pouvez utiliser `noreply@visioncrm.app`

✅ **Status:** Email configuré

---

## 5️⃣ Tester l'application en production (5 min)

### A. Test de la page d'accueil

1. **Ouvrez:** https://visioncrm-new.vercel.app

2. **Vérifiez que:**
   - ✅ La page charge sans erreur
   - ✅ Le design s'affiche correctement
   - ✅ Les boutons "Se connecter" et "S'inscrire" sont visibles

### B. Test de l'inscription

1. **Cliquez sur "S'inscrire"**

2. **Remplissez le formulaire:**
   - Nom de l'entreprise: `Test Garage`
   - Votre nom: `Test User`
   - Email: **VOTRE VRAI EMAIL**
   - Mot de passe: `Test123456!`

3. **Cliquez sur "Créer un compte"**

4. **Vérifiez que:**
   - ✅ Vous êtes redirigé vers une page de confirmation
   - ✅ Vous recevez un email de vérification dans votre boîte mail

### C. Test de la vérification d'email

1. **Ouvrez votre boîte mail**

2. **Trouvez l'email** de VisionCRM

3. **Cliquez sur le lien** de vérification

4. **Vérifiez que:**
   - ✅ Vous êtes redirigé vers la page de connexion
   - ✅ Un message de succès s'affiche

### D. Test de la connexion

1. **Sur la page de connexion:** https://visioncrm-new.vercel.app/login

2. **Connectez-vous** avec vos identifiants

3. **Vérifiez que:**
   - ✅ Vous êtes connecté avec succès
   - ✅ Vous êtes redirigé vers le dashboard
   - ✅ Le dashboard affiche vos informations

### E. Test du dashboard

1. **Une fois connecté, vérifiez:**
   - ✅ Les statistiques s'affichent
   - ✅ La sidebar fonctionne
   - ✅ Vous pouvez naviguer entre les pages

2. **Testez la création d'un contact:**
   - Allez dans **"Contacts"**
   - Cliquez sur **"+ Nouveau contact"**
   - Remplissez le formulaire
   - Vérifiez que le contact est créé

### F. Test de la connexion OAuth Google (optionnel)

1. **Déconnectez-vous**

2. **Sur la page de connexion:**
   - Cliquez sur **"Se connecter avec Google"**
   - Autorisez l'application
   - Vérifiez que vous êtes connecté

---

## ✅ Checklist finale

Cochez au fur et à mesure:

### Configuration Vercel
- [ ] NEXTAUTH_URL mis à jour vers `https://visioncrm-new.vercel.app`
- [ ] Application redéployée après modification
- [ ] Nouveau déploiement réussi

### Configuration Stripe
- [ ] Webhook URL mis à jour vers `https://visioncrm-new.vercel.app/api/webhooks/stripe`
- [ ] Événements Stripe configurés
- [ ] Test webhook réussi (status 200)

### Configuration Google OAuth
- [ ] Redirect URI ajouté: `https://visioncrm-new.vercel.app/api/auth/callback/google`
- [ ] Redirect URI localhost conservé pour dev
- [ ] Credentials sauvegardés

### Configuration Email
- [ ] Email Resend configuré (resend.dev ou domaine vérifié)
- [ ] Variable RESEND_FROM_EMAIL mise à jour si nécessaire

### Tests Production
- [ ] Page d'accueil charge sans erreur
- [ ] Inscription fonctionne
- [ ] Email de vérification reçu
- [ ] Lien de vérification fonctionne
- [ ] Connexion réussie
- [ ] Dashboard accessible et fonctionnel
- [ ] Création de contact fonctionne
- [ ] OAuth Google fonctionne (optionnel)

---

## 🎉 Félicitations !

Si toutes les cases sont cochées, votre application VisionCRM est:

✅ **100% fonctionnelle en production**
✅ **Sécurisée avec de nouvelles clés API**
✅ **Prête à accueillir vos premiers utilisateurs**

---

## 🚀 Prochaines étapes (optionnel)

### Domaine personnalisé

Si vous voulez utiliser un domaine personnalisé comme `app.visioncrm.com`:

1. **Vercel Dashboard** → Votre projet → **Domains**
2. Ajoutez votre domaine
3. Configurez vos DNS selon les instructions
4. **Puis mettez à jour:**
   - `NEXTAUTH_URL` dans Vercel
   - Webhook Stripe
   - OAuth Redirect URIs

### Monitoring et Analytics

1. **Activer Vercel Analytics:**
   - Déjà inclus avec `@vercel/analytics`
   - Fonctionne automatiquement en production

2. **Configurer Sentry (optionnel):**
   - Créez un projet sur https://sentry.io
   - Ajoutez les variables d'environnement Sentry dans Vercel
   - Redéployez

### Mode Production

1. **Créez vos produits Stripe:**
   - Définissez vos plans tarifaires
   - Créez les Price IDs
   - Mettez à jour les variables `NEXT_PUBLIC_STRIPE_PRICE_*`

2. **Passez en mode production Stripe:**
   - Activez votre compte Stripe
   - Remplacez les clés de test par les clés de production
   - Mettez à jour le webhook

---

**Date:** 2026-01-07
**Application:** VisionCRM
**URL:** https://visioncrm-new.vercel.app
**Status:** ✅ En production
