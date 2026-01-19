# Lighthouse Optimization Guide - VisionCRM

Guide complet pour atteindre des scores Lighthouse > 90 sur toutes les métriques.

## 🎯 Objectifs

| Métrique | Target | Production |
|----------|--------|------------|
| **Performance** | ≥ 90 | [À mesurer] |
| **Accessibility** | ≥ 95 | [À mesurer] |
| **Best Practices** | ≥ 95 | [À mesurer] |
| **SEO** | ≥ 90 | [À mesurer] |

### Web Vitals Targets

| Métrique | Good | Needs Improvement | Poor |
|----------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |

---

## 🚀 Performance Optimization

### 1. Next.js Configuration

✅ **Déjà implémenté** dans `next.config.js` :

```javascript
{
  // Compression Gzip/Brotli
  compress: true,

  // SWC Minification (plus rapide que Terser)
  swcMinify: true,

  // Remove console.log en production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'], // Formats modernes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
}
```

### 2. Image Optimization

**✅ Utiliser `next/image` partout :**

```typescript
// ❌ Bad
<img src="/logo.png" alt="Logo" />

// ✅ Good
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo VisionCRM"
  width={200}
  height={60}
  priority // Pour images above-the-fold
  placeholder="blur" // Optional: smooth loading
/>
```

**Actions :**
1. Audit: `grep -r "<img" app/ components/` → Remplacer par `<Image />`
2. Ajouter `width` et `height` pour éviter CLS
3. Utiliser `priority` pour images critiques (hero, logo)

### 3. Code Splitting

**✅ Dynamic imports pour composants lourds :**

```typescript
import dynamic from 'next/dynamic';

// Lazy load composants non critiques
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false, // Si pas besoin de SSR
});

// Exemple: Dashboard charts
const DashboardCharts = dynamic(() => import('@/components/dashboard/Charts'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
});
```

**Composants à lazy loader :**
- Charts (recharts)
- PDF viewer
- Rich text editor (si utilisé)
- Modals lourds

### 4. Font Optimization

✅ **Next.js Font Optimization :**

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Évite FOIT (Flash of Invisible Text)
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

**Optimisations :**
- `display: 'swap'` → Affiche fallback pendant chargement
- `preload: true` → Précharge la font
- Limiter aux subsets nécessaires (`latin` suffit pour FR)

### 5. JavaScript Bundle Size

**Analyse bundle :**

```bash
# Installer bundle analyzer
pnpm add -D @next/bundle-analyzer

# Analyser
ANALYZE=true pnpm run build
```

**Optimisations :**
- Supprimer dépendances inutilisées
- Tree-shaking automatique (Next.js)
- Code splitting automatique par route

**Target :** First Load JS < 250 KB

### 6. Preload Critical Resources

```typescript
// app/layout.tsx
export const metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

// Preload critical assets
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```

### 7. Caching Strategy

**Next.js Static Generation :**

```typescript
// Page avec ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour

export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Static exports pour pages publiques :**
- `/legal/privacy-policy` → Static
- `/legal/terms` → Static
- Pages marketing → Static

---

## ♿ Accessibility (A11y)

### 1. Semantic HTML

```typescript
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>
```

### 2. ARIA Labels

```typescript
// Navigation
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// Forms
<label htmlFor="email">Email</label>
<input id="email" name="email" type="email" aria-required="true" />

// Buttons
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>
```

### 3. Color Contrast

**Minimum ratios :**
- Normal text: 4.5:1
- Large text (18px+): 3:1

**Outils :**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools: Lighthouse → Accessibility

**Vérifier :**
```bash
# Audit avec axe-core
pnpm add -D @axe-core/playwright

# Test accessibility
pnpm exec playwright test tests/a11y/
```

### 4. Keyboard Navigation

**Tous les éléments interactifs doivent être accessibles au clavier :**

```typescript
// Focus visible
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Action
</button>

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### 5. Alt Text sur Images

```typescript
// ✅ Descriptive alt text
<Image
  src="/dashboard-preview.png"
  alt="Dashboard showing sales statistics and recent activity"
  width={800}
  height={600}
/>

// ✅ Empty alt for decorative images
<Image src="/decoration.svg" alt="" />
```

---

## 📱 Best Practices

### 1. HTTPS Everywhere

✅ Vercel automatic HTTPS + HSTS header

### 2. Security Headers

✅ **Déjà implémenté** (voir `next.config.js`) :

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`

**Vérifier :**
```bash
curl -I https://app.visioncrm.com | grep -E "X-Frame|Strict-Transport"
```

### 3. Console Errors

**Production :** 0 erreurs console

```bash
# Build et test
pnpm run build
pnpm run start

# Ouvrir DevTools Console
# Expected: No errors
```

### 4. Deprecated APIs

**Éviter :**
- `document.write()`
- `unload` event (utiliser `visibilitychange`)
- `XMLHttpRequest` (utiliser `fetch`)

### 5. Permissions Policy

✅ Déjà configuré :

```javascript
'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
```

---

## 🔍 SEO

### 1. Meta Tags

```typescript
// app/layout.tsx
export const metadata = {
  title: {
    default: 'VisionCRM - Gestion de garage automobile',
    template: '%s | VisionCRM',
  },
  description: 'Solution complète pour garages : devis, factures, clients, tâches. Gestion simplifiée de votre activité automobile.',
  keywords: ['CRM', 'garage', 'automobile', 'devis', 'factures', 'gestion'],
  authors: [{ name: 'VisionCRM Team' }],
  creator: 'VisionCRM',
  publisher: 'VisionCRM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'VisionCRM - Gestion de garage automobile',
    description: 'Solution complète pour garages automobiles',
    url: 'https://visioncrm.app',
    siteName: 'VisionCRM',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://visioncrm.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VisionCRM Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisionCRM',
    description: 'Solution complète pour garages automobiles',
    images: ['https://visioncrm.app/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

### 2. Structured Data (JSON-LD)

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VisionCRM',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };

  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Sitemap.xml

```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://visioncrm.app',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://visioncrm.app/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://visioncrm.app/register',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://visioncrm.app/legal/privacy-policy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}
```

### 4. robots.txt

```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/admin/'],
    },
    sitemap: 'https://visioncrm.app/sitemap.xml',
  };
}
```

### 5. Canonical URLs

```typescript
// app/page.tsx
export const metadata = {
  alternates: {
    canonical: 'https://visioncrm.app',
  },
};
```

---

## 🧪 Testing Lighthouse

### Method 1: Chrome DevTools

1. Ouvrir Chrome DevTools (`F12`)
2. Onglet **"Lighthouse"**
3. Sélectionner:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
4. Mode: **Desktop** ET **Mobile**
5. Cliquer **"Analyze page load"**

### Method 2: CLI

```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Analyser
lighthouse https://app.visioncrm.com --output html --output-path ./lighthouse-report.html --view

# Desktop
lighthouse https://app.visioncrm.com --preset=desktop --output html --output-path ./lighthouse-desktop.html

# Mobile
lighthouse https://app.visioncrm.com --preset=mobile --output html --output-path ./lighthouse-mobile.html
```

### Method 3: PageSpeed Insights

https://pagespeed.web.dev/
- Enter URL: `https://app.visioncrm.com`
- Analyse Desktop + Mobile

---

## 📊 Optimizations Checklist

### Performance

- [x] Next.js compression enabled
- [x] SWC minification enabled
- [x] Remove console.log in production
- [x] Image optimization (AVIF/WebP)
- [x] Font optimization (next/font)
- [ ] Dynamic imports for heavy components
- [ ] Bundle analysis done (<250KB target)
- [ ] Preload critical resources
- [ ] Static generation where possible

### Accessibility

- [ ] All images have alt text
- [ ] Color contrast ≥ 4.5:1
- [ ] Keyboard navigation works
- [ ] ARIA labels on interactive elements
- [ ] Form labels properly associated
- [ ] Focus indicators visible
- [ ] No accessibility errors (axe-core)

### Best Practices

- [x] HTTPS enabled
- [x] Security headers configured
- [ ] 0 console errors in production
- [ ] No deprecated APIs used
- [x] Permissions policy set
- [x] CSP configured

### SEO

- [ ] Meta tags complete
- [ ] Open Graph tags added
- [ ] Twitter Card configured
- [ ] Structured data (JSON-LD)
- [ ] Sitemap.xml generated
- [ ] robots.txt configured
- [ ] Canonical URLs set
- [ ] Mobile-friendly
- [ ] Page titles unique and descriptive

---

## 🎯 Action Plan

### Phase 1: Quick Wins (1-2h)

1. ✅ Update `next.config.js` (compression, minify, images)
2. ✅ Add security headers
3. Add meta tags to `app/layout.tsx`
4. Add sitemap.ts and robots.ts
5. Run Lighthouse audit (baseline)

### Phase 2: Image Optimization (2-3h)

1. Audit all `<img>` tags
2. Replace with `<Image />` from next/image
3. Add width/height to prevent CLS
4. Compress existing images (ImageOptim, Squoosh)
5. Convert to AVIF/WebP where possible

### Phase 3: Accessibility (2-3h)

1. Add alt text to all images
2. Add ARIA labels to buttons/icons
3. Check color contrast (fix if needed)
4. Test keyboard navigation
5. Run axe-core audit

### Phase 4: Performance (3-4h)

1. Dynamic import heavy components
2. Analyze bundle size
3. Remove unused dependencies
4. Add static generation where possible
5. Optimize database queries (if slow)

### Phase 5: Final Audit (1h)

1. Run Lighthouse (Desktop + Mobile)
2. Document results
3. Fix remaining issues
4. Re-audit until >90 all metrics

---

## 📝 Documentation Results

After optimizations, document in `LIGHTHOUSE_RESULTS.md`:

```markdown
## Lighthouse Scores

**Desktop:**
- Performance: 95
- Accessibility: 98
- Best Practices: 100
- SEO: 100

**Mobile:**
- Performance: 92
- Accessibility: 98
- Best Practices: 100
- SEO: 100

**Web Vitals:**
- LCP: 1.8s (Good)
- FID: 45ms (Good)
- CLS: 0.05 (Good)
```

---

## 🔗 Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Version:** 1.0
**Dernière mise à jour:** Janvier 2026
**Propriétaire:** Frontend Team
