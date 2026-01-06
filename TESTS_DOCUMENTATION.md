# VisionCRM - Tests Documentation

Documentation complète de la stratégie de tests et de la couverture.

## 📊 Vue d'ensemble

**Test Framework:** Vitest 4.0.16
**Test Library:** @testing-library/react 16.3.1
**Coverage Tool:** v8
**Environment:** jsdom (pour composants React)

### Couverture Actuelle (27%)

```
----------------|---------|----------|---------|---------|
File            | % Stmts | % Branch | % Funcs | % Lines |
----------------|---------|----------|---------|---------|
All files       |   27.1  |   28.88  |  33.33  |  26.66  |
 auth.ts        |   7.5   |   25.92  |  33.33  |   7.5   |
 prisma.ts      |   25    |   22.22  |    0    |  21.42  |
 rate-limit.ts  |  29.26  |   44.44  |  66.66  |  29.26  |
 validations.ts |   100   |    100   |   100   |   100   | ✅
----------------|---------|----------|---------|---------|
```

## ✅ Tests Implémentés (48 tests)

### 1. Authentication Tests (`tests/lib/auth.test.ts`) - 12 tests

**Module testé:** `lib/auth.ts`
**Couverture:** Password hashing et verification (33.33% du fichier)

#### Tests de Hashing
- ✅ Génère un hash valide
- ✅ Génère des hashes différents avec salts différents
- ✅ Gère les mots de passe vides
- ✅ Gère les caractères spéciaux
- ✅ Gère les mots de passe très longs (100 caractères)

#### Tests de Vérification
- ✅ Vérifie un mot de passe correct
- ✅ Rejette un mot de passe incorrect
- ✅ Rejette un mot de passe vide
- ✅ Est sensible à la casse
- ✅ Gère les caractères Unicode (emojis, accents)

#### Tests de Sécurité
- ✅ Hash en moins d'1 seconde (anti-DoS)
- ✅ Comparaison constant-time (anti timing attacks)

**Exemple de test:**
```typescript
it('should verify correct password', async () => {
  const password = 'TestPassword123!';
  const hash = await hashPassword(password);
  const isValid = await verifyPassword(password, hash);
  expect(isValid).toBe(true);
});
```

### 2. Validation Tests (`tests/lib/validations.test.ts`) - 26 tests

**Module testé:** `lib/validations.ts`
**Couverture:** 100% ✅ (complet)

#### registerSchema (8 tests)
- ✅ Valide les données correctes
- ✅ Requiert name, email, password, tenantName, subdomain
- ✅ Valide le format email
- ✅ Valide la longueur minimale du mot de passe
- ✅ Valide le format subdomain (lowercase, no spaces)
- ✅ Accepte les sous-domaines avec tirets
- ✅ Accepte différents formats d'email valides

#### loginSchema (5 tests)
- ✅ Valide les données correctes
- ✅ Requiert email et password
- ✅ Valide le format email
- ✅ Accepte les emails en majuscules

#### quoteSchema (6 tests)
- ✅ Valide les données correctes
- ✅ Requiert contact_id, valid_until, items
- ✅ Requiert au moins un item
- ✅ Valide la structure des items (quantity positive)
- ✅ Permet des notes optionnelles

#### invoiceSchema (7 tests)
- ✅ Valide les données correctes
- ✅ Requiert contact_id, due_date, items
- ✅ Requiert au moins un item
- ✅ Permet quote_id optionnel
- ✅ Permet SIRET et TVA optionnels
- ✅ Valide les prix positifs

**Exemple de test:**
```typescript
it('should validate correct registration data', () => {
  const result = registerSchema.safeParse({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    tenantName: 'Test Company',
    subdomain: 'testcompany',
  });
  expect(result.success).toBe(true);
});
```

### 3. Rate Limiting Tests (`tests/lib/rate-limit.test.ts`) - 10 tests

**Module testé:** `lib/rate-limit.ts`
**Couverture:** 29.26% (IP extraction bien testée)

#### getClientIp (6 tests)
- ✅ Extrait l'IP de x-forwarded-for
- ✅ Extrait l'IP de x-real-ip
- ✅ Préfère x-forwarded-for sur x-real-ip
- ✅ Gère plusieurs IPs dans x-forwarded-for (prend la première)
- ✅ Génère un IP dev quand aucun header
- ✅ Génère des IPs dev différentes pour chaque requête

#### checkRateLimit (4 tests)
- ✅ Retourne success quand limite non dépassée
- ✅ Gère différents types de rate limits (ai_chat, login, register, password_reset, api_general)
- ✅ Inclut un timestamp de reset
- ✅ Fonctionne avec différentes IPs

**Exemple de test:**
```typescript
it('should extract IP from x-forwarded-for header', () => {
  const request = new Request('http://localhost:3000', {
    headers: {
      'x-forwarded-for': '192.168.1.1, 10.0.0.1',
    },
  });
  const ip = getClientIp(request);
  expect(ip).toBe('192.168.1.1');
});
```

## 🔧 Configuration

### `vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 25,
        functions: 30,
        branches: 25,
        statements: 25,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### `tests/setup.ts`

Setup global pour tous les tests:
- ✅ Cleanup automatique après chaque test
- ✅ Mock des variables d'environnement
- ✅ Mock de Next.js router (`useRouter`, `usePathname`, `useSearchParams`)
- ✅ Mock de Next.js headers
- ✅ Mock de ResizeObserver (pour composants UI)

## 📝 Scripts NPM

```json
{
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:coverage": "vitest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

## 🎯 Stratégie de Tests

### ✅ Ce qui est bien testé

1. **Validations Zod** - 100% coverage
   - Tous les schemas (register, login, quote, invoice)
   - Edge cases et formats invalides

2. **Cryptographie** - Security-focused
   - Password hashing avec bcrypt
   - Vérification sécurisée
   - Tests anti-DoS et anti-timing attacks

3. **Rate Limiting** - Extraction IP complète
   - Gestion des headers proxy
   - Génération d'IPs de dev
   - Support multi-proxy

### 🔄 Ce qui pourrait être ajouté (future iterations)

1. **API Route Tests** (complexe avec Next.js App Router)
   - `/api/register`
   - `/api/auth/login`
   - `/api/quotes`
   - `/api/invoices`
   - `/api/webhooks/stripe`

2. **Component Tests**
   - Formulaires d'authentification
   - Tables CRM
   - Modals et dialogs

3. **Integration Tests**
   - Flux complet d'inscription
   - Création devis → facture
   - Gestion webhooks Stripe

4. **E2E Tests** (avec Playwright)
   - User journeys complets
   - Tests cross-browser

## 🚀 Lancer les Tests

### Tous les tests
```bash
pnpm test
```

### Tests en mode watch
```bash
pnpm test:watch
```

### Avec coverage
```bash
pnpm test:coverage
```

### Coverage report HTML
Après `pnpm test:coverage`, ouvrir:
```
coverage/index.html
```

## 📈 Progression

### Version Actuelle
- **48 tests** ✅ (100% pass rate)
- **27% coverage** (dépasse le threshold de 25%)
- **3 fichiers de tests**
- **Focus:** Libs & utilities critiques

### Objectifs Futurs
- [ ] Ajouter tests d'API routes avec MSW
- [ ] Atteindre 50% coverage
- [ ] Tests de composants React critiques
- [ ] Tests E2E avec Playwright
- [ ] CI/CD integration (GitHub Actions)

## 🔍 Debugging

### Voir les tests qui échouent
```bash
pnpm test --reporter=verbose
```

### Mode UI interactif
```bash
pnpm test --ui
```

### Coverage par fichier
```bash
pnpm test:coverage
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright E2E](https://playwright.dev/)

## 🎉 Achievements

✅ **Foundation solide** avec 48 tests
✅ **100% coverage** sur validations critiques
✅ **Security tests** pour crypto et rate limiting
✅ **CI-ready** avec thresholds configurés
✅ **Fast** - Tests s'exécutent en ~8 secondes

## 📞 Support

Pour ajouter de nouveaux tests:
1. Créer un fichier `*.test.ts` dans `tests/`
2. Importer les fonctions à tester
3. Écrire les tests avec `describe()` et `it()`
4. Lancer `pnpm test` pour vérifier

**Rappel:** Tous les mocks Next.js sont déjà configurés dans `tests/setup.ts`
