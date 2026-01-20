# Configuration des Sous-domaines Multi-Tenant

## Contexte

VisionCRM est configuré pour supporter les sous-domaines multi-tenant (chaque garage a son propre sous-domaine), mais cette fonctionnalité n'est pas encore activée.

## Architecture

- `masterauto57.vision-crm.app` → Garage Master Auto 57
- `garage-dupont.vision-crm.app` → Garage Dupont
- `vision-crm.app` → Page de connexion principale

## Configuration requise

### 1. Vercel - Wildcard Domain

1. Allez sur Vercel Dashboard → Settings → Domains
2. Ajoutez le domaine wildcard: `*.vision-crm.app`
3. Suivez les instructions DNS de Vercel

### 2. DNS Configuration

Chez votre fournisseur DNS, ajoutez:

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: Auto/3600
```

Cela permet à TOUS les sous-domaines (`*.vision-crm.app`) de pointer vers Vercel.

### 3. Middleware Update

Le middleware doit extraire le subdomain et charger le tenant correspondant:

```typescript
// middleware.ts
import { getSubdomainFromHost, getTenantBySubdomain } from '@/lib/tenant';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const subdomain = getSubdomainFromHost(host);

  // Si subdomain détecté, vérifier qu'il existe
  if (subdomain) {
    const tenant = await getTenantBySubdomain(subdomain);

    if (!tenant) {
      // Subdomain invalide → redirection
      return NextResponse.redirect(new URL('/login', 'https://vision-crm.app'));
    }

    // Injecter tenant dans headers pour l'API
    request.headers.set('x-tenant-id', tenant.id);
    request.headers.set('x-tenant-subdomain', subdomain);
  }

  // ... reste du middleware
}
```

### 4. Auth Configuration

Adapter la session pour prendre en compte le subdomain:

```typescript
// auth.ts
callbacks: {
  session: async ({ session, token }) => {
    // Vérifier que le tenant du user correspond au subdomain
    const host = headers().get('host') || '';
    const subdomain = getSubdomainFromHost(host);

    if (subdomain && session.user.tenant?.subdomain !== subdomain) {
      // User tente d'accéder au mauvais tenant
      throw new Error('UNAUTHORIZED: Tenant mismatch');
    }

    return session;
  }
}
```

## Avantages

✅ **Branding**: Chaque garage a son URL personnalisée
✅ **Isolation**: Séparation visuelle claire entre tenants
✅ **Sécurité**: URL différente = moins de risque de confusion
✅ **SEO**: Chaque tenant peut avoir son propre SEO

## Inconvénients

⚠️ **Complexité**: Configuration DNS + middleware
⚠️ **Coût**: Vercel peut facturer les domaines wildcard
⚠️ **Certificats SSL**: Nécessite wildcard SSL (inclus dans Vercel)

## Alternative Actuelle (Plus Simple)

Sans sous-domaines, utiliser un **path-based tenant**:
- `vision-crm.app/masterauto57/dashboard`
- `vision-crm.app/garage-dupont/dashboard`

Mais cette approche est moins élégante et moins sécurisée.

## Recommandation

**Activer les sous-domaines** pour une vraie solution multi-tenant professionnelle.
