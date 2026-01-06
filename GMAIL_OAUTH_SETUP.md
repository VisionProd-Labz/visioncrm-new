# Configuration Gmail OAuth pour VisionCRM

Ce guide vous explique comment configurer Gmail OAuth pour permettre aux utilisateurs de connecter leur compte Gmail et envoyer des emails directement depuis VisionCRM.

## ✅ Prérequis

- Un compte Google
- Accès à Google Cloud Console
- Application VisionCRM déployée (ou localhost:3000 pour dev)

## 📋 Étapes de configuration

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur **"Sélectionner un projet"** → **"Nouveau projet"**
3. Nom du projet: `VisionCRM` (ou votre nom)
4. Cliquez sur **"Créer"**

### 2. Activer Gmail API

1. Dans votre projet, allez dans **"APIs & Services"** → **"Library"**
2. Cherchez **"Gmail API"**
3. Cliquez sur **"Enable"** (Activer)

### 3. Configurer l'écran de consentement OAuth

1. Allez dans **"APIs & Services"** → **"OAuth consent screen"**
2. Sélectionnez **"External"** (sauf si vous avez Google Workspace)
3. Cliquez sur **"Create"**

**Configuration de l'écran:**
- **App name**: VisionCRM
- **User support email**: votre-email@gmail.com
- **Developer contact**: votre-email@gmail.com
- **Authorized domains** (si en production): votre-domaine.com

4. Cliquez sur **"Save and Continue"**

**Scopes:**
1. Cliquez sur **"Add or Remove Scopes"**
2. Ajoutez ces scopes manuellement:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
3. Cliquez sur **"Update"** puis **"Save and Continue"**

**Test users (si app non publiée):**
1. Ajoutez les emails qui pourront se connecter en test
2. Cliquez sur **"Save and Continue"**

### 4. Créer les identifiants OAuth 2.0

1. Allez dans **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"+ Create Credentials"** → **"OAuth client ID"**
3. Sélectionnez **"Web application"**

**Configuration:**
- **Name**: VisionCRM Web Client

**Authorized JavaScript origins:**
```
http://localhost:3000
https://votre-domaine.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/email/oauth/gmail/callback
https://votre-domaine.com/api/email/oauth/gmail/callback
```

⚠️ **Important**: Si vous utilisez le port 3001, ajustez l'URL: `http://localhost:3001/...`

4. Cliquez sur **"Create"**
5. **Copiez** le `Client ID` et le `Client Secret`

### 5. Configurer les variables d'environnement

Dans votre fichier `.env`:

```env
# Gmail OAuth
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

⚠️ Pour la production, utilisez votre vraie URL dans `NEXT_PUBLIC_APP_URL`.

### 6. Redémarrer le serveur

```bash
pnpm dev
```

## 🚀 Utilisation

1. Allez sur **http://localhost:3000/email**
2. Cliquez sur **"Ajouter un compte"**
3. Sélectionnez **"Gmail"**
4. Cliquez sur **"Se connecter avec Gmail"**
5. Autorisez l'application à envoyer des emails
6. Vous serez redirigé vers VisionCRM avec votre compte Gmail connecté ✅

## 🧪 Tester l'envoi d'email

1. Allez dans **Équipe** → **Inviter un membre**
2. Entrez un email et sélectionnez un rôle
3. L'invitation sera envoyée via votre compte Gmail connecté !

## ⚠️ Limitations en mode Test

Si votre app Google Cloud est en mode **"Testing"**:
- Seuls les **Test users** configurés peuvent se connecter
- Limite de 100 utilisateurs test
- Le token refresh fonctionne pendant 7 jours max

Pour lever ces limitations:
1. **Publiez votre app** dans Google Cloud Console
2. Google demandera une vérification si vous dépassez certains seuils d'utilisateurs

## 🔧 Dépannage

### Erreur: "redirect_uri_mismatch"
- Vérifiez que l'URL de redirection est **exactement** la même dans:
  - Google Cloud Console
  - Votre variable `NEXT_PUBLIC_APP_URL`
- N'oubliez pas `/api/email/oauth/gmail/callback` à la fin
- Vérifiez le port (3000 ou 3001)

### Erreur: "access_denied"
- L'utilisateur a annulé l'autorisation
- Si l'utilisateur n'est pas dans les Test Users, ajoutez-le

### Erreur: "Token expiré"
- Le refresh token devrait automatiquement régénérer un nouveau token
- Si le problème persiste, reconnectez le compte Gmail

### Emails non envoyés
- Vérifiez que Gmail API est bien activée
- Vérifiez que le scope `gmail.send` est autorisé
- Vérifiez les logs serveur pour plus de détails

## 📚 Ressources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 Google](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

✅ **Félicitations !** Votre VisionCRM peut maintenant envoyer des emails via Gmail OAuth.
