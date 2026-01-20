# Configuration Wildcard Domain - Guide Rapide

## ✅ Code déployé!

Le système de sous-domaines multi-tenant est **activé** dans le code (commit `4f3ea12`).

## 🚨 Configuration REQUISE

Pour que les sous-domaines fonctionnent, vous devez configurer:

### 1. Vercel - Wildcard Domain (5 minutes)

1. **Allez sur Vercel Dashboard**
   - https://vercel.com/visionprod-labz/visioncrm-new
   - Settings → Domains

2. **Ajoutez le domaine wildcard**
   ```
   *.vision-crm.app
   ```

3. **Vercel va vous demander d'ajouter des enregistrements DNS**

### 2. DNS Configuration (5 minutes)

Chez votre fournisseur DNS (Vercel, Cloudflare, etc.):

**Ajoutez un enregistrement CNAME wildcard:**

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: Auto (ou 3600)
```

**IMPORTANT:** Cet enregistrement permet à TOUS les sous-domaines (`*.vision-crm.app`) de pointer vers Vercel.

### 3. Vérification (2 minutes)

Une fois configuré, testez:

1. **Subdomain de votre compte:**
   ```
   https://masterauto57.vision-crm.app
   ```

   Devrait afficher la page de login (ou dashboard si connecté)

2. **Subdomain invalide:**
   ```
   https://test-invalid.vision-crm.app
   ```

   Devrait rediriger vers `vision-crm.app/login?error=invalid_subdomain`

3. **Base domain:**
   ```
   https://vision-crm.app
   ```

   Page de login principale (sans tenant)

## Comment ça marche maintenant

### Avant (Mode partagé)
❌ Tous les utilisateurs sur `vision-crm.app`
❌ Pas d'isolation visuelle
❌ Risque de confusion entre tenants

### Après (Mode subdomain)
✅ `masterauto57.vision-crm.app` → Votre garage
✅ `garage-dupont.vision-crm.app` → Autre garage
✅ Isolation stricte: impossible d'accéder au mauvais tenant
✅ Branding personnalisé par URL

## Architecture Technique

### Middleware (middleware.ts)
```typescript
// 1. Extrait le subdomain depuis l'URL
const subdomain = getSubdomainFromHost(host);
// exemple: masterauto57

// 2. Vérifie que le tenant existe en base
const tenant = await getTenantBySubdomain(subdomain);

// 3. Si invalide → redirect
if (!tenant) {
  return redirect('/login?error=invalid_subdomain');
}

// 4. Si user connecté, vérifie qu'il appartient au bon tenant
if (session.user.tenantId !== tenant.id) {
  return redirect('/login?error=wrong_tenant');
}

// 5. Inject headers pour les API routes
response.headers.set('x-tenant-id', tenant.id);
```

### URLs disponibles

| URL | Comportement |
|-----|--------------|
| `vision-crm.app` | Page login principale (pas de tenant) |
| `masterauto57.vision-crm.app` | Login/Dashboard pour MASTER AUTO 57 |
| `invalid.vision-crm.app` | Redirect → erreur subdomain invalide |

## Sécurité

✅ **Isolation stricte:** Un user ne peut accéder qu'au subdomain de son tenant
✅ **Validation:** Subdomains vérifiés contre la base de données
✅ **Headers injectés:** Les API routes reçoivent automatiquement le tenant ID
✅ **Logs:** Tentatives d'accès invalides sont loggées

## Avantages

1. **Professionnalisme:** Chaque garage a son URL
2. **SEO:** Chaque tenant peut avoir son propre référencement
3. **Branding:** URL personnalisée renforce l'identité
4. **Sécurité:** Isolation visuelle et technique stricte

## FAQ

**Q: Puis-je utiliser mon propre domaine?**
R: Oui! Configurez `garage.mondomaine.com` dans Vercel et pointez votre DNS.

**Q: Combien de subdomains sont supportés?**
R: Illimité. Chaque nouveau tenant créé obtient automatiquement son subdomain.

**Q: Que se passe-t-il si j'accède au mauvais subdomain?**
R: Le middleware vous redirige vers la page de login avec un message d'erreur explicite.

**Q: Les données sont-elles isolées?**
R: Oui! Les API routes reçoivent le `x-tenant-id` header et filtrent automatiquement par tenant.

## Prochaines étapes

1. ✅ Configurez le wildcard domain dans Vercel
2. ✅ Ajoutez l'enregistrement DNS CNAME
3. ✅ Testez votre subdomain `masterauto57.vision-crm.app`
4. ✅ Vérifiez que les subdomains invalides sont bloqués

## Support

Si vous rencontrez des problèmes:
- Vérifiez les logs Vercel: Deployments → Functions
- Vérifiez la propagation DNS: https://dnschecker.org
- Temps de propagation: 5-30 minutes généralement
