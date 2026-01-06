# 🎭 VisionCRM - Stratégie Compte Démo

**Date:** 2026-01-05
**Objectif:** Définir les limites du compte demo public vs comptes clients réels

---

## 🎯 PROBLÈME ACTUEL

### ⚠️ Compte Demo Sans Protection
```
Email: demo@visioncrm.app
Password: demo123456!
Tenant: demo (subdomain)
```

**Risques actuels:**
- ❌ N'importe qui peut modifier les données
- ❌ N'importe qui peut supprimer contacts/véhicules/devis
- ❌ Données demo peuvent être "cassées" par les visiteurs
- ❌ Pas de reset automatique
- ❌ Pas de séparation demo publique vs tests privés

**Conséquence:** Si 10 personnes testent en même temps, le chaos !

---

## 🎨 STRATÉGIES POSSIBLES

### **Stratégie A: Demo Read-Only (Recommandé)** ⭐

**Concept:** Visiteurs peuvent voir mais PAS modifier

**Permissions:**
- ✅ Se connecter au compte demo
- ✅ Naviguer dans toutes les pages
- ✅ Voir contacts/véhicules/devis existants
- ✅ Ouvrir détails/dashboards/reports
- ✅ Utiliser AI Assistant (limité)
- ❌ **Créer** contacts/véhicules/devis
- ❌ **Modifier** données existantes
- ❌ **Supprimer** quoi que ce soit
- ❌ Inviter membres équipe
- ❌ Modifier settings

**UI:**
- Bannière en haut : "Mode Démo - Lecture seule. Créez un compte pour tester toutes les fonctionnalités"
- Boutons "Créer/Modifier/Supprimer" désactivés
- CTA visible : "Créer mon compte gratuit"

**Avantages:**
- ✅ Données demo toujours propres
- ✅ Expérience cohérente pour tous
- ✅ Pas besoin de reset
- ✅ Incite à créer un vrai compte

**Inconvénients:**
- ⚠️ Moins interactif
- ⚠️ Frustrant pour ceux qui veulent "toucher"

---

### **Stratégie B: Demo avec Reset Auto**

**Concept:** Chacun peut modifier, mais reset toutes les heures

**Mécanisme:**
```typescript
// Cron job toutes les heures
async function resetDemoAccount() {
  // 1. Supprimer toutes données demo tenant
  await prisma.contact.deleteMany({
    where: { tenant_id: DEMO_TENANT_ID }
  });

  // 2. Re-seed données demo
  await seedDemoData();

  // 3. Log reset
  console.log('Demo account reset at', new Date());
}
```

**Permissions:**
- ✅ Tout modifier/créer/supprimer
- ⚠️ Changements perdus au prochain reset

**Avantages:**
- ✅ Vraiment interactif
- ✅ Visiteurs peuvent tester création
- ✅ Données redeviennent propres régulièrement

**Inconvénients:**
- ⚠️ Complexité technique (cron job)
- ⚠️ Risque de conflit entre utilisateurs simultanés
- ⚠️ Changements perdus = frustrant

---

### **Stratégie C: Demo Personnel Temporaire**

**Concept:** Chaque visiteur crée un compte demo temporaire

**Flow:**
```
1. Page démo → Clic "Essayer maintenant"
2. Génère compte temporaire:
   - Email: demo_[random]@temp.visioncrm.app
   - Tenant: demo_[random]
   - Pré-rempli avec données seed
3. Expire après 24h
4. Suppression auto après 48h
```

**Permissions:**
- ✅ Compte dédié = liberté totale
- ✅ Pas d'interférence avec autres utilisateurs
- ✅ Vraie expérience complète

**Avantages:**
- ✅ Meilleure expérience utilisateur
- ✅ Isolation complète
- ✅ Vrai test end-to-end

**Inconvénients:**
- ⚠️ Complexe à implémenter
- ⚠️ Coût DB (beaucoup de tenants temporaires)
- ⚠️ Nettoyage requis

---

## 🎯 RECOMMANDATION

### **Approche Hybride (Meilleur des mondes)**

#### Phase 1: Lancement (Stratégie A - Read-Only)
**Pourquoi:**
- ✅ Rapide à implémenter (2-3h)
- ✅ Zéro risque de données cassées
- ✅ Bon pour premiers visiteurs
- ✅ Force conversion vers vrai compte

**Implémentation:**
```typescript
// middleware.ts ou lib/demo-protection.ts

export const DEMO_TENANT_ID = 'uuid-du-tenant-demo';
export const DEMO_USER_EMAIL = 'demo@visioncrm.app';

export function isDemoAccount(session: Session): boolean {
  return session.user.email === DEMO_USER_EMAIL;
}

export function checkDemoWritePermission(session: Session) {
  if (isDemoAccount(session)) {
    throw new Error('Mode démo - Lecture seule. Créez un compte pour modifier.');
  }
}

// Dans chaque API POST/PATCH/DELETE:
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  checkDemoWritePermission(session); // ← Bloque si demo

  // ... reste du code
}
```

**Temps:** 2-3h de dev
**Effort:** Moyen

---

#### Phase 2: Post-Launch (Stratégie C - Comptes Temporaires)
**Quand:** 2-4 semaines après lancement

**Pourquoi:**
- Meilleure conversion
- Expérience premium
- Différenciation concurrence

**Effort:** 1-2 jours de dev

---

## 📋 PLAN D'IMPLÉMENTATION - Phase 1 (Read-Only)

### Étape 1: Identifier le Tenant Demo (5min)
```typescript
// lib/demo.ts

export const DEMO_CONFIG = {
  tenantId: 'uuid-du-tenant-demo', // À récupérer de la DB
  email: 'demo@visioncrm.app',
  subdomain: 'demo',
  maxAIQueries: 10, // Limite queries AI
};

export function isDemoTenant(tenantId: string): boolean {
  return tenantId === DEMO_CONFIG.tenantId;
}

export function isDemoUser(email?: string | null): boolean {
  return email === DEMO_CONFIG.email;
}
```

---

### Étape 2: Protéger les APIs d'Écriture (1-2h)

```typescript
// lib/middleware/demo-protection.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isDemoUser } from '@/lib/demo';
import { NextResponse } from 'next/server';

export async function requireNonDemo() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (isDemoUser(session.user.email)) {
    return NextResponse.json(
      {
        error: 'Mode Démo - Lecture seule',
        message: 'Créez un compte gratuit pour tester toutes les fonctionnalités',
        code: 'DEMO_READ_ONLY'
      },
      { status: 403 }
    );
  }

  return null; // OK
}

// Utilisation dans chaque API d'écriture:
export async function POST(req: Request) {
  const demoError = await requireNonDemo();
  if (demoError) return demoError;

  // ... reste du code normal
}
```

**APIs à protéger:**
- `POST /api/contacts` (création)
- `PATCH /api/contacts/[id]` (modification)
- `DELETE /api/contacts/[id]` (suppression)
- Idem pour: vehicles, quotes, invoices, tasks, etc.
- `POST /api/team/invite` (invitation)
- `PATCH /api/settings/*` (modification settings)

---

### Étape 3: UI - Afficher Bannière Demo (30min)

```typescript
// components/demo-banner.tsx

'use client';

import { useSession } from 'next-auth/react';
import { isDemoUser } from '@/lib/demo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Eye, Lock } from 'lucide-react';
import Link from 'next/link';

export function DemoBanner() {
  const { data: session } = useSession();

  if (!session?.user || !isDemoUser(session.user.email)) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-500 bg-amber-50">
      <Eye className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>Mode Démo</strong> - Vous êtes en lecture seule.
          Les données ne peuvent pas être modifiées.
        </span>
        <Link href="/register">
          <Button size="sm" variant="default">
            Créer mon compte gratuit
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}

// Dans app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>
        <DemoBanner /> {/* ← Ajouter ici */}
        {children}
      </main>
    </div>
  );
}
```

---

### Étape 4: Désactiver Boutons d'Action (30min)

```typescript
// hooks/use-demo-mode.ts

import { useSession } from 'next-auth/react';
import { isDemoUser } from '@/lib/demo';
import { useToast } from '@/components/ui/use-toast';

export function useDemoMode() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const isDemo = isDemoUser(session?.user?.email);

  const showDemoWarning = () => {
    toast({
      title: 'Mode Démo',
      description: 'Créez un compte pour modifier les données',
      variant: 'warning',
    });
  };

  return {
    isDemo,
    showDemoWarning,
  };
}

// Utilisation dans les composants:
function ContactForm() {
  const { isDemo, showDemoWarning } = useDemoMode();

  const handleSubmit = (data) => {
    if (isDemo) {
      showDemoWarning();
      return;
    }

    // ... normal submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button
        type="submit"
        disabled={isDemo} // ← Désactiver si demo
      >
        {isDemo ? 'Mode Démo' : 'Enregistrer'}
      </Button>
    </form>
  );
}
```

---

### Étape 5: Limiter AI Assistant (15min)

```typescript
// app/api/ai/assistant/route.ts

import { DEMO_CONFIG, isDemoUser } from '@/lib/demo';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const isDemo = isDemoUser(session?.user?.email);

  if (isDemo) {
    // Vérifier compteur queries demo
    const count = await redis.incr(`ai:demo:queries:${date}`);

    if (count > DEMO_CONFIG.maxAIQueries) {
      return NextResponse.json({
        error: 'Limite atteinte',
        message: `Le compte demo est limité à ${DEMO_CONFIG.maxAIQueries} requêtes AI par jour. Créez un compte pour plus.`,
      }, { status: 429 });
    }
  }

  // ... reste du code
}
```

---

## 📊 MATRICE DE PERMISSIONS

| Action | Compte Demo | Compte Gratuit | Compte Payant |
|--------|-------------|----------------|---------------|
| **Lecture** |
| Voir dashboard | ✅ | ✅ | ✅ |
| Voir contacts | ✅ (5 max affichés) | ✅ (100 max) | ✅ (illimité) |
| Voir devis | ✅ | ✅ | ✅ |
| Voir rapports | ✅ | ✅ | ✅ |
| **Écriture** |
| Créer contact | ❌ | ✅ | ✅ |
| Modifier contact | ❌ | ✅ | ✅ |
| Supprimer contact | ❌ | ✅ | ✅ |
| Créer devis | ❌ | ✅ | ✅ |
| Créer facture | ❌ | ✅ | ✅ |
| **Team** |
| Inviter membre | ❌ | ❌ | ✅ |
| Gérer rôles | ❌ | ❌ | ✅ |
| **AI** |
| Queries AI | 10/jour | 100/mois | 1000/mois |
| **Communications** |
| Envoyer email | ❌ | ✅ (50/mois) | ✅ (500/mois) |
| WhatsApp | ❌ | ❌ | ✅ |
| **Export** |
| Export CSV | ❌ | ✅ | ✅ |
| Export PDF | ❌ | ✅ | ✅ |

---

## 🎯 EXPÉRIENCE UTILISATEUR OPTIMALE

### Flow Visiteur sur Demo
```
1. Arrive sur landing page
   ↓
2. Clic "Essayer la démo"
   ↓
3. Login auto avec compte demo
   ↓
4. Bannière jaune : "Mode démo - Lecture seule"
   ↓
5. Explore toutes les pages
   ↓
6. Tente de créer un contact
   ↓
7. Toast: "Créez un compte pour modifier"
   ↓
8. CTA visible partout : "Créer mon compte gratuit"
   ↓
9. Conversion !
```

### Messages d'Incitation
**Contextuels selon l'action:**

- Clic "Nouveau contact" → "Créez un compte pour ajouter vos propres contacts"
- Clic "Modifier" → "Créez un compte pour modifier les données"
- Clic "Supprimer" → "Créez un compte pour gérer vos données"
- AI Assistant (après 10 queries) → "Créez un compte pour plus de requêtes AI"

**Non intrusif mais visible:**
- Bannière en haut (fermeture possible)
- Badge "DEMO" sur les boutons désactivés
- CTA dans sidebar
- CTA dans header

---

## 🚀 COMPTE CLIENT RÉEL (Pour Toi)

### Pourquoi Créer un Vrai Compte ?

**Pour tester complètement:**
- ✅ Workflow création/modification/suppression
- ✅ Upload documents (carte grise, factures)
- ✅ Invitation membres équipe
- ✅ Configuration settings
- ✅ Vraies données métier
- ✅ Export/Import
- ✅ Intégrations (email, WhatsApp)

**Comment faire:**
```
1. Va sur /register
2. Email: ton-email@example.com
3. Nom entreprise: "Test Garage SARL"
4. Subdomain: "test-garage"
5. Créé ton compte

→ Nouveau tenant complètement isolé
→ Liberté totale de tester
→ Pas d'impact sur demo publique
```

---

## 📝 CHECKLIST IMPLÉMENTATION

### Phase 1: Demo Read-Only (2-3h)
- [ ] Créer `lib/demo.ts` avec helpers
- [ ] Créer `lib/middleware/demo-protection.ts`
- [ ] Protéger toutes APIs POST/PATCH/DELETE
- [ ] Créer `<DemoBanner />` component
- [ ] Créer `useDemoMode()` hook
- [ ] Désactiver boutons d'action si demo
- [ ] Limiter AI Assistant (10 queries/jour)
- [ ] Tester : vérifier qu'aucune modification possible
- [ ] Messages d'erreur clairs + CTA conversion

### Phase 2: Tests
- [ ] Créer ton compte client réel
- [ ] Tester workflow complet sur vrai compte
- [ ] Vérifier isolation tenant (démo vs réel)
- [ ] Documenter bugs trouvés

### Phase 3: Tracking (optionnel)
- [ ] Google Analytics : track tentatives d'action en mode demo
- [ ] Mesurer conversion demo → signup
- [ ] A/B test messages CTA

---

## 💡 RECOMMANDATION FINALE

### Aujourd'hui (2-3h)
1. ✅ **Implémente Stratégie A (Read-Only)**
   - Protection demo = 2h de dev
   - Expérience cohérente garantie
   - Pas de risque données cassées

2. ✅ **Crée TON compte client réel**
   - Subdomain: "kuetey-test" ou "test-garage"
   - Pour tester sans limites
   - Isolé du compte demo public

### Demain
3. Configure les APIs manquantes sur ton compte réel
4. Teste workflow complet end-to-end
5. Documente bugs trouvés

### J+2
6. Deploy en production
7. Compte demo read-only accessible au public
8. Marketing & lancement !

---

## 🎉 CONCLUSION

**Compte Demo Public:**
- ✅ Read-only pour protection
- ✅ Incite à créer vrai compte
- ✅ Expérience cohérente
- ⏱️ 2-3h d'implémentation

**Ton Compte Test:**
- ✅ Liberté totale
- ✅ Tester toutes features
- ✅ Isolé du public
- ⏱️ 2min de création

**Win-Win ! 🚀**
