# VisionCRM - Système de Design Krypton

Guide complet du système de design pour VisionCRM, inspiré du design Krypton.

## 📁 Structure

```
lib/
  └── design-system.ts          # Tokens et configuration du design system

components/ui/krypton/
  ├── index.ts                  # Export centralisé
  ├── krypton-card.tsx          # Cards glassmorphiques
  ├── krypton-button.tsx        # Boutons avec gradients
  ├── krypton-badge.tsx         # Badges colorés
  ├── krypton-stat.tsx          # Cards KPI
  └── krypton-input.tsx         # Inputs avec focus glow

app/
  └── globals.css               # Classes utility Tailwind
```

## 🎨 Design Tokens

### Couleurs

```typescript
import { kryptonDesign } from '@/lib/design-system';

// Couleurs principales
kryptonDesign.colors.primary        // #f68100 (Orange)
kryptonDesign.colors.secondary      // #0099ff (Bleu)
kryptonDesign.colors.success        // #10b981 (Vert)
kryptonDesign.colors.purple         // #8b5cf6 (Violet)

// Backgrounds
kryptonDesign.colors.background.primary    // #07010f
kryptonDesign.colors.background.card       // rgba(226,232,255,0.12)

// Textes
kryptonDesign.colors.text.primary    // #ffffff
kryptonDesign.colors.text.muted      // rgba(255,255,255,0.60)
```

### Gradients

```typescript
// Classes prêtes à l'emploi
kryptonDesign.gradients.orange.class   // "from-[#ff9500] via-[#f68100] to-[#ff9500]"
kryptonDesign.gradients.blue.class     // "from-[#0099ff] to-[#0077cc]"
kryptonDesign.gradients.green.class    // "from-[#10b981] to-[#059669]"
```

## 🧩 Composants

### KryptonCard

Card glassmorphique avec effet hover.

```tsx
import { KryptonCard, KryptonCardWithAccent } from '@/components/ui/krypton';

// Card simple
<KryptonCard padding="md" hover>
  <h3>Titre</h3>
  <p>Contenu</p>
</KryptonCard>

// Card avec ligne d'accent
<KryptonCardWithAccent
  accentColor="#f68100"
  accentPosition="bottom"
  padding="lg"
>
  <h3>Titre</h3>
  <p>Contenu</p>
</KryptonCardWithAccent>
```

**Props:**
- `padding`: 'sm' | 'md' | 'lg' | 'xl'
- `hover`: boolean (affiche l'effet hover)
- `className`: string
- `onClick`: () => void

### KryptonButton

Bouton avec gradient et effet glow.

```tsx
import { KryptonButton } from '@/components/ui/krypton';

<KryptonButton
  variant="primary"
  size="md"
  icon={<Plus className="w-4 h-4" />}
  iconPosition="left"
  onClick={() => {}}
>
  Cliquez ici
</KryptonButton>
```

**Variants:**
- `primary`: Gradient orange
- `secondary`: Gradient bleu
- `success`: Gradient vert
- `purple`: Gradient violet
- `outline`: Transparent avec bordure

**Sizes:**
- `sm`: h-9, text-sm
- `md`: h-11, text-base
- `lg`: h-14, text-lg

### KryptonBadge

Badge coloré pour les statuts et labels.

```tsx
import { KryptonBadge } from '@/components/ui/krypton';

<KryptonBadge
  variant="primary"
  size="md"
  icon={<Star className="w-3 h-3" />}
>
  VIP
</KryptonBadge>
```

**Variants:**
- `default`: Blanc transparent
- `primary`: Orange
- `secondary`: Bleu
- `success`: Vert
- `warning`: Ambre
- `error`: Rouge
- `purple`: Violet

### KryptonStat

Card KPI avec icône, valeur et indicateur de changement.

```tsx
import { KryptonStat } from '@/components/ui/krypton';
import { Euro } from 'lucide-react';

<KryptonStat
  title="Chiffre d'affaires"
  value="45,678€"
  subtitle="Ce mois-ci"
  change={15.3}
  icon={<Euro className="w-5 h-5" />}
  accentColor="#f68100"
/>
```

### KryptonInput

Input avec focus glow et support icône.

```tsx
import { KryptonInput } from '@/components/ui/krypton';
import { Search } from 'lucide-react';

<KryptonInput
  type="text"
  placeholder="Rechercher..."
  icon={<Search className="w-4 h-4" />}
  iconPosition="left"
  error="Champ requis"
/>
```

## 🎭 Animations Framer Motion

```tsx
import { motion } from 'framer-motion';
import { kryptonAnimations } from '@/lib/design-system';

// Container avec stagger
<motion.div
  variants={kryptonAnimations.container}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={kryptonAnimations.item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// Scale on hover
<motion.button {...kryptonAnimations.scaleOnHover}>
  Cliquez
</motion.button>
```

**Animations disponibles:**
- `container`: Stagger pour listes
- `item`: Spring pour éléments
- `fadeIn`: Fade simple
- `scaleOnHover`: Zoom au hover
- `slideLeft`: Slide depuis la gauche
- `slideUp`: Slide depuis le bas

## 🎨 Classes Utility (Tailwind)

### Cards

```html
<!-- Card simple -->
<div class="krypton-card">...</div>

<!-- Card avec hover -->
<div class="krypton-card-hover">...</div>

<!-- Glassmorphism fort -->
<div class="glass-strong">...</div>
```

### Buttons

```html
<button class="krypton-button-primary">Primaire</button>
<button class="krypton-button-secondary">Secondaire</button>
<button class="krypton-button-success">Succès</button>
<button class="krypton-button-outline">Outline</button>
```

### Inputs

```html
<input type="text" class="krypton-input" placeholder="Texte..." />
```

### Badges

```html
<span class="krypton-badge-primary">Orange</span>
<span class="krypton-badge-secondary">Bleu</span>
<span class="krypton-badge-success">Vert</span>
```

### Glows

```html
<div class="glow-orange">...</div>
<div class="glow-blue">...</div>
<div class="glow-green">...</div>
<div class="glow-purple">...</div>
```

### Lignes d'accent

```html
<div class="relative">
  <div class="accent-line-orange"></div>
</div>
```

## 📐 Espacement

```typescript
// Padding des cards
kryptonDesign.spacing.cardPadding.sm   // p-4
kryptonDesign.spacing.cardPadding.md   // p-5
kryptonDesign.spacing.cardPadding.lg   // p-6

// Gap entre éléments
kryptonDesign.spacing.sectionGap.sm    // gap-3
kryptonDesign.spacing.sectionGap.md    // gap-5
kryptonDesign.spacing.sectionGap.lg    // gap-8

// Margin entre sections
kryptonDesign.spacing.pageMargin.default   // space-y-8
```

## 🔤 Typographie

```typescript
// Headings
kryptonDesign.typography.heading.h1
// "text-4xl md:text-5xl font-bold text-white tracking-tight"

// Body
kryptonDesign.typography.body.large
// "text-lg text-white/60"
```

## 💡 Exemples d'utilisation

### Page Dashboard

```tsx
import { motion } from 'framer-motion';
import { kryptonAnimations } from '@/lib/design-system';
import { KryptonStat, KryptonCard } from '@/components/ui/krypton';
import { Euro, Users, Car } from 'lucide-react';

export default function Dashboard() {
  return (
    <motion.div
      className="space-y-8"
      variants={kryptonAnimations.container}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={kryptonAnimations.item}>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Tableau de bord
        </h1>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-5">
        <motion.div variants={kryptonAnimations.item}>
          <KryptonStat
            title="Chiffre d'affaires"
            value="45,678€"
            change={15.3}
            icon={<Euro className="w-5 h-5" />}
            accentColor="#f68100"
          />
        </motion.div>

        <motion.div variants={kryptonAnimations.item}>
          <KryptonStat
            title="Clients"
            value="145"
            change={8.2}
            icon={<Users className="w-5 h-5" />}
            accentColor="#0099ff"
          />
        </motion.div>

        <motion.div variants={kryptonAnimations.item}>
          <KryptonStat
            title="Véhicules"
            value="287"
            change={12.1}
            icon={<Car className="w-5 h-5" />}
            accentColor="#10b981"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
```

### Liste avec Cards

```tsx
import { KryptonCard } from '@/components/ui/krypton';

{items.map((item) => (
  <KryptonCard key={item.id} hover padding="lg">
    <h3 className="text-xl font-bold text-white">{item.title}</h3>
    <p className="text-white/60">{item.description}</p>
  </KryptonCard>
))}
```

## 🛠️ Helpers

### buildKryptonClasses

Helpers pour construire des classes dynamiquement:

```typescript
import { buildKryptonClasses } from '@/lib/design-system';

// Card avec ou sans hover
const cardClasses = buildKryptonClasses.card(true);

// Button avec variant
const buttonClasses = buildKryptonClasses.button('primary');

// Input
const inputClasses = buildKryptonClasses.input();

// Badge avec variant
const badgeClasses = buildKryptonClasses.badge('success');
```

### getKryptonColor

Récupérer une couleur du design system:

```typescript
import { getKryptonColor } from '@/lib/design-system';

const primaryColor = getKryptonColor('primary');
// → "#f68100"

const cardBg = getKryptonColor('background.card');
// → "rgba(226,232,255,0.12)"
```

## 📝 Bonnes pratiques

1. **Toujours utiliser les composants Krypton** pour une cohérence maximale
2. **Animations** : Utiliser `kryptonAnimations` pour les effets
3. **Couleurs** : Référencer depuis `kryptonDesign.colors`
4. **Espacement** : Utiliser les tokens d'espacement définis
5. **Classes utility** : Préférer les classes `.krypton-*` aux styles inline

## 🎯 Checklist pour nouvelles pages

- [ ] Importer `kryptonAnimations` et `motion`
- [ ] Wrapper la page dans `motion.div` avec `containerVariants`
- [ ] Utiliser `KryptonCard` au lieu de `Card`
- [ ] Utiliser `KryptonButton` au lieu de `Button`
- [ ] Utiliser `KryptonBadge` pour les statuts
- [ ] Appliquer les animations `itemVariants` aux éléments
- [ ] Vérifier le responsive
- [ ] Tester les effets hover
