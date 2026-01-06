# Configuration Sentry Error Monitoring

Ce guide vous explique comment configurer Sentry pour le monitoring des erreurs en production.

## 🎯 Pourquoi Sentry ?

- **Visibilité complète** : Toutes les erreurs frontend et backend sont capturées
- **Stack traces détaillées** : Debug facile avec source maps
- **Alertes en temps réel** : Notification instantanée des erreurs critiques
- **Session Replay** : Replay vidéo des sessions avec erreurs
- **Performance monitoring** : Suivi des performances de l'app

---

## 1️⃣ Créer un compte Sentry

1. Allez sur [sentry.io](https://sentry.io/)
2. Cliquez sur **"Get Started"** ou **"Sign Up"**
3. Créez un compte (gratuit jusqu'à 5000 erreurs/mois)

---

## 2️⃣ Créer un projet

1. Une fois connecté, cliquez sur **"Create Project"**
2. Sélectionnez **"Next.js"** comme plateforme
3. **Project name** : `visioncrm` (ou le nom de votre choix)
4. **Alert frequency** : Laissez par défaut ou choisissez "Alert me on every new issue"
5. Cliquez sur **"Create Project"**

---

## 3️⃣ Obtenir les credentials

### DSN (Data Source Name)

Après avoir créé le projet, vous verrez le **DSN** :
```
https://[KEY]@[ORG_ID].ingest.us.sentry.io/[PROJECT_ID]
```

**Copiez ce DSN**, vous en aurez besoin !

### Organisation et Projet

1. Allez dans **Settings** → **Projects** → Votre projet
2. Notez :
   - **Organization Slug** : Le nom de votre organisation (visible dans l'URL)
   - **Project Slug** : Le nom de votre projet

### Auth Token (pour upload des source maps)

1. Allez dans **Settings** → **Account** → **Auth Tokens**
2. Cliquez sur **"Create New Token"**
3. **Token name** : `visioncrm-sourcemaps`
4. **Scopes** : Cochez `project:releases` et `project:read`
5. Cliquez sur **"Create Token"**
6. **Copiez le token** (vous ne pourrez plus le voir après !)

---

## 4️⃣ Configurer les variables d'environnement

Ouvrez votre fichier `.env` et ajoutez :

```env
# MONITORING - SENTRY
SENTRY_DSN="https://[KEY]@[ORG_ID].ingest.us.sentry.io/[PROJECT_ID]"
NEXT_PUBLIC_SENTRY_DSN="https://[KEY]@[ORG_ID].ingest.us.sentry.io/[PROJECT_ID]"
SENTRY_ORG="votre-organisation"
SENTRY_PROJECT="visioncrm"
SENTRY_AUTH_TOKEN="votre-auth-token"
```

**Exemple concret** :
```env
SENTRY_DSN="https://abc123def456@o123456.ingest.us.sentry.io/789012"
NEXT_PUBLIC_SENTRY_DSN="https://abc123def456@o123456.ingest.us.sentry.io/789012"
SENTRY_ORG="my-company"
SENTRY_PROJECT="visioncrm"
SENTRY_AUTH_TOKEN="sntrys_abc123def456..."
```

---

## 5️⃣ Tester la configuration

### En développement

Sentry est automatiquement configuré ! Pour tester :

1. Lancez l'application :
```bash
pnpm dev
```

2. Déclenchez volontairement une erreur pour tester :
   - Ajoutez un bouton de test dans votre app :
   ```tsx
   <button onClick={() => { throw new Error('Test Sentry!') }}>
     Test Sentry
   </button>
   ```

3. Cliquez sur le bouton

4. Allez sur [sentry.io](https://sentry.io/) → **Issues**

5. Vous devriez voir l'erreur "Test Sentry!" apparaître ! 🎉

### En production

Les erreurs seront automatiquement capturées et envoyées à Sentry :

- **Erreurs JavaScript** : Exceptions non gérées
- **Erreurs React** : Composants qui crashent
- **Erreurs API** : Erreurs serveur (500, etc.)
- **Erreurs réseau** : Échecs d'appels API

---

## 6️⃣ Configurer les alertes

### Par email

1. Dans Sentry, allez dans **Settings** → **Projects** → Votre projet
2. **Alerts** → **Create Alert Rule**
3. Choisissez **"Issues"**
4. **Alert name** : `Nouvelles erreurs VisionCRM`
5. **Conditions** :
   - "When a new issue is created"
   - "When the issue is seen more than 10 times"
6. **Actions** : "Send a notification via Email"
7. **Save Rule**

### Par Slack (optionnel)

1. Dans Sentry : **Settings** → **Integrations**
2. Cherchez **Slack** → **Install**
3. Autorisez l'accès à votre workspace Slack
4. Sélectionnez le canal (#alerts, #errors, etc.)
5. Configurez les notifications

---

## 7️⃣ Fonctionnalités avancées

### Session Replay

Session Replay est déjà activé ! Il enregistre automatiquement les sessions avec erreurs.

**Voir un replay** :
1. Cliquez sur une erreur dans Sentry
2. Onglet **"Replays"**
3. Regardez la vidéo de ce qui s'est passé avant l'erreur

### Source Maps

Les source maps sont automatiquement uploadées en production grâce à `SENTRY_AUTH_TOKEN`.

Vous verrez le code source original dans les stack traces (pas le code minifié) !

### Performance Monitoring

Pour activer le monitoring de performance :

1. Dans `sentry.client.config.ts`, changez :
```typescript
tracesSampleRate: 0.1, // 10% des transactions tracées (économise le quota)
```

2. Vous verrez ensuite :
   - Temps de chargement des pages
   - Temps des requêtes API
   - Slow queries

---

## 8️⃣ Quota et limites

### Plan gratuit

- **5,000 erreurs/mois**
- **Replay de 50 sessions/mois**
- **Rétention de 30 jours**

### Si vous dépassez

Options :
1. **Filtrer les erreurs** : Ignorer les erreurs non importantes
2. **Augmenter le sampling** : Ne capturer que 50% des erreurs
3. **Upgrade** : Passer au plan payant (à partir de $26/mois)

### Filtrer les erreurs

Dans `sentry.client.config.ts`, ajoutez dans `ignoreErrors` :
```typescript
ignoreErrors: [
  'ResizeObserver loop',  // Erreur bénigne de navigateur
  'Non-Error promise rejection', // Rejets de promesses
  // Ajoutez d'autres erreurs à ignorer
],
```

---

## 9️⃣ Dashboard Sentry

### Onglets principaux

- **Issues** : Liste des erreurs
- **Performance** : Monitoring de performance
- **Replays** : Session replays
- **Releases** : Historique des déploiements
- **Alerts** : Gestion des alertes

### Métriques à surveiller

- **Error Rate** : Taux d'erreur (devrait être < 1%)
- **Affected Users** : Nombre d'utilisateurs impactés
- **Frequency** : Fréquence des erreurs

---

## 🎉 C'est tout !

Votre error monitoring est maintenant configuré. Toutes les erreurs seront :
- ✅ Capturées automatiquement
- ✅ Envoyées à Sentry
- ✅ Visibles dans le dashboard
- ✅ Notifiées par email/Slack

**Pro tip** : Consultez Sentry régulièrement (une fois par jour) pour identifier et corriger les bugs avant qu'ils n'affectent trop d'utilisateurs !

---

## 🆘 Troubleshooting

### Les erreurs n'apparaissent pas dans Sentry

1. Vérifiez que `SENTRY_DSN` est bien configuré
2. Vérifiez que le DSN est valide (copié correctement)
3. Redémarrez le serveur après avoir modifié `.env`
4. Vérifiez la console : Si Sentry est activé, vous verrez des logs

### "Sentry is not initialized"

Redémarrez Next.js :
```bash
# Arrêtez pnpm dev (Ctrl+C)
pnpm dev
```

### Source maps manquantes

Vérifiez que `SENTRY_AUTH_TOKEN` est configuré dans `.env`

---

## 📞 Support

- **Documentation Sentry** : https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Support Sentry** : https://sentry.io/support/
- **Discord Sentry** : https://discord.gg/sentry
