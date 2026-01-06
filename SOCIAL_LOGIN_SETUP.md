# Configuration Social Login pour VisionCRM

Ce guide vous explique comment configurer la connexion sociale (Google, Facebook, LinkedIn, X/Twitter) pour permettre aux utilisateurs de se connecter avec leurs comptes existants.

## 🎯 Avantages du Social Login

- **Onboarding rapide**: Les utilisateurs se connectent en 1 clic
- **Pas de mot de passe à retenir**: Utilise leurs comptes existants
- **Taux de conversion élevé**: Moins de friction à l'inscription
- **Création automatique de tenant**: Un compte VisionCRM est créé automatiquement

---

## 1️⃣ Google OAuth Setup

### Étape 1: Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur **"Sélectionner un projet"** → **"Nouveau projet"**
3. Nom: `VisionCRM` → **"Créer"**

### Étape 2: Configurer l'écran de consentement

1. **APIs & Services** → **OAuth consent screen**
2. Sélectionnez **"External"** → **"Create"**
3. Remplissez:
   - **App name**: VisionCRM
   - **User support email**: votre-email@gmail.com
   - **Developer contact**: votre-email@gmail.com
4. **Save and Continue** (pas besoin de scopes pour social login)

### Étape 3: Créer les credentials

1. **APIs & Services** → **Credentials**
2. **+ Create Credentials** → **OAuth client ID**
3. **Application type**: Web application
4. **Name**: VisionCRM Social Login

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:3001
https://votre-domaine.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
https://votre-domaine.com/api/auth/callback/google
```

5. **Create** → Copiez le **Client ID** et **Client Secret**

### Ajouter dans `.env`:
```env
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklm"
```

---

## 2️⃣ Facebook OAuth Setup

### Étape 1: Créer une app Facebook

1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. **My Apps** → **Create App**
3. Sélectionnez **"Consumer"** → **Next**
4. **App name**: VisionCRM
5. **App contact email**: votre-email@gmail.com
6. **Create App**

### Étape 2: Configurer Facebook Login

1. Dans votre app, cherchez **"Facebook Login"** → **Set Up**
2. Choisissez **"Web"**
3. **Site URL**: `http://localhost:3000`

### Étape 3: Configurer OAuth redirect URIs

1. **Facebook Login** → **Settings**
2. **Valid OAuth Redirect URIs**:
```
http://localhost:3000/api/auth/callback/facebook
http://localhost:3001/api/auth/callback/facebook
https://votre-domaine.com/api/auth/callback/facebook
```
3. **Save Changes**

### Étape 4: Obtenir les credentials

1. **Settings** → **Basic**
2. Copiez **App ID** et **App Secret** (cliquez "Show")

### Ajouter dans `.env`:
```env
FACEBOOK_CLIENT_ID="your-app-id"
FACEBOOK_CLIENT_SECRET="your-app-secret"
```

### ⚠️ Mode développement
Par défaut, l'app est en mode "Development". Pour la production:
1. **App Mode** → Switch to **Live**
2. Remplissez les informations requises (Privacy Policy, etc.)

---

## 3️⃣ LinkedIn OAuth Setup

### Étape 1: Créer une app LinkedIn

1. Allez sur [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. **Create app**
3. Remplissez:
   - **App name**: VisionCRM
   - **LinkedIn Page**: Sélectionnez ou créez une page
   - **App logo**: Upload un logo (optionnel)
   - **Legal agreement**: Cochez la case
4. **Create app**

### Étape 2: Configurer l'app

1. Onglet **Auth**
2. **Redirect URLs**:
```
http://localhost:3000/api/auth/callback/linkedin
http://localhost:3001/api/auth/callback/linkedin
https://votre-domaine.com/api/auth/callback/linkedin
```
3. **Update**

### Étape 3: Demander les permissions

1. Onglet **Products**
2. Demandez **"Sign In with LinkedIn using OpenID Connect"**
3. Attendez l'approbation (instantané en général)

### Étape 4: Obtenir les credentials

1. Onglet **Auth**
2. Copiez **Client ID** et **Client Secret**

### Ajouter dans `.env`:
```env
LINKEDIN_CLIENT_ID="your-client-id"
LINKEDIN_CLIENT_SECRET="your-client-secret"
```

---

## 4️⃣ Twitter/X OAuth Setup

### Étape 1: Créer une app Twitter

1. Allez sur [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. **Sign up** pour un compte développeur (si pas déjà fait)
3. **+ Create Project** → **+ Add App**
4. **App name**: VisionCRM
5. Copiez les **API Key** et **API Secret** (sauvegardez-les !)

### Étape 2: Configurer OAuth 2.0

1. Dans votre app, allez dans **Settings**
2. **User authentication settings** → **Set up**
3. **App permissions**: Read
4. **Type of App**: Web App
5. **App info**:
   - **Callback URL**:
   ```
   http://localhost:3000/api/auth/callback/twitter
   ```
   - **Website URL**: `http://localhost:3000`
6. **Save**

### Étape 3: Obtenir OAuth 2.0 credentials

1. Dans **Keys and tokens**
2. Section **OAuth 2.0 Client ID and Client Secret**
3. Copiez **Client ID** et **Client Secret**

### Ajouter dans `.env`:
```env
TWITTER_CLIENT_ID="your-client-id"
TWITTER_CLIENT_SECRET="your-client-secret"
```

---

## ✅ Configuration finale

### 1. Vérifiez votre `.env`

Assurez-vous que vous avez au minimum:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere"

# Au moins un provider configuré
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 2. Redémarrez le serveur

```bash
pnpm dev
```

### 3. Testez la connexion

1. Allez sur **http://localhost:3000/login**
2. Cliquez sur un des boutons sociaux (Google, Facebook, LinkedIn, X)
3. Autorisez l'application
4. Vous serez redirigé vers le dashboard avec votre compte créé automatiquement !

---

## 🎨 Personnalisation

### Désactiver un provider

Si vous ne voulez pas tous les providers, commentez-les dans `lib/auth.ts`:

```typescript
// FacebookProvider({
//   clientId: process.env.FACEBOOK_CLIENT_ID || '',
//   clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
// }),
```

### Modifier l'ordre des boutons

Dans `components/auth/social-login.tsx`, réorganisez les boutons dans la grid.

---

## 🔧 Dépannage

### Erreur: "redirect_uri_mismatch"
- Vérifiez que l'URL de redirection est **exactement** la même
- N'oubliez pas le port (3000 ou 3001)
- Vérifiez `NEXTAUTH_URL` dans `.env`

### Erreur: "access_denied"
- L'utilisateur a annulé l'autorisation
- Vérifiez les permissions de l'app

### Utilisateur créé mais pas de tenant
- Le callback `signIn` dans `lib/auth.ts` devrait créer le tenant automatiquement
- Vérifiez les logs serveur

### Provider button ne s'affiche pas
- Vérifiez que le CSS est chargé
- Vérifiez la console navigateur pour les erreurs

---

## 📚 Ressources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Guide](https://developers.facebook.com/docs/facebook-login/)
- [LinkedIn OAuth](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Twitter OAuth 2.0](https://developer.twitter.com/en/docs/authentication/oauth-2-0)

---

✅ **Social Login configuré !** Vos utilisateurs peuvent maintenant se connecter en 1 clic avec leurs comptes préférés.
