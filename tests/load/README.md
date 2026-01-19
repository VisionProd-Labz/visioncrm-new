# Load Testing avec k6

Ce dossier contient les scripts de load testing pour VisionCRM utilisant [k6](https://k6.io/).

## 📋 Vue d'ensemble

Deux scripts disponibles :

1. **load-test-simple.js** - Test basique des pages publiques (homepage, login, register)
2. **load-test.js** - Test complet avec authentification et navigation

## 🔧 Installation de k6

### macOS

```bash
brew install k6
```

### Windows

```bash
# Via Chocolatey
choco install k6

# Via winget
winget install k6 --source winget
```

### Linux (Ubuntu/Debian)

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Docker

```bash
docker pull grafana/k6:latest
```

## 🚀 Utilisation

### Test simple (pages publiques)

```bash
# Local
k6 run tests/load/load-test-simple.js

# Staging
k6 run --env BASE_URL=https://staging.visioncrm.app tests/load/load-test-simple.js

# Production (avec précaution!)
k6 run --env BASE_URL=https://app.visioncrm.com tests/load/load-test-simple.js
```

### Test complet (avec authentification)

```bash
# Local (nécessite serveur Next.js en cours d'exécution)
# Terminal 1: pnpm run dev
# Terminal 2:
k6 run tests/load/load-test.js

# Staging
k6 run --env BASE_URL=https://staging.visioncrm.app tests/load/load-test.js
```

### Avec Docker

```bash
docker run --rm -i grafana/k6:latest run --env BASE_URL=http://host.docker.internal:3000 - < tests/load/load-test-simple.js
```

## 📊 Métriques clés

### Résultat attendu (✅ PASS)

```
✓ http_req_duration........: avg=250ms  p(95)=420ms  [PASS < 500ms]
✓ http_req_failed..........: 0.8%                     [PASS < 5%]
✓ http_reqs................: 12,543 (209/s)
✓ errors...................: 0.4%                     [PASS < 5%]
```

### Thresholds configurés

| Métrique | Seuil | Description |
|----------|-------|-------------|
| `http_req_duration` | `p(95) < 500ms` | 95% des requêtes < 500ms |
| `http_req_failed` | `rate < 0.05` | Taux d'erreur < 5% |
| `errors` (custom) | `rate < 0.05` | Erreurs métier < 5% |

## 📈 Scénarios de test

### load-test-simple.js

**Profil de charge:**
- 0-30s: Ramp-up de 0 à 20 utilisateurs
- 30s-1m30s: Ramp-up de 20 à 50 utilisateurs
- 1m30s-2m30s: Ramp-up de 50 à 100 utilisateurs
- 2m30s-4m30s: Maintien à 100 utilisateurs
- 4m30s-5m: Ramp-down de 100 à 0

**Pages testées:**
- Homepage `/`
- Login page `/login`
- Register page `/register`

### load-test.js

**Profil de charge:**
- 0-30s: Ramp-up de 0 à 10 utilisateurs
- 30s-1m30s: Ramp-up de 10 à 50 utilisateurs
- 1m30s-3m30s: Ramp-up de 50 à 100 utilisateurs
- 3m30s-5m30s: Maintien à 100 utilisateurs
- 5m30s-6m: Ramp-down de 100 à 0

**Scénarios utilisateur:**
1. **Browse Dashboard** - Login → Dashboard → Stats API
2. **Browse Contacts** - Login → Contacts list → Contact detail
3. **Browse Quotes** - Login → Quotes list
4. **Browse Invoices** - Login → Invoices list
5. **Browse Tasks** - Login → Tasks list

## 🔍 Analyse des résultats

### Identifier les goulots d'étranglement

```bash
# Lancer avec output détaillé
k6 run --out json=results.json tests/load/load-test.js

# Analyser les résultats
k6 inspect results.json
```

### Métriques HTTP détaillées

k6 affiche automatiquement :

- **http_req_duration** : Temps de réponse complet
  - min, max, avg, med, p(90), p(95), p(99)
- **http_req_waiting** : Temps d'attente du serveur (TTFB)
- **http_req_receiving** : Temps de réception des données
- **http_req_sending** : Temps d'envoi de la requête
- **http_reqs** : Nombre total de requêtes
- **iterations** : Nombre d'itérations complètes
- **vus** : Virtual Users actifs
- **vus_max** : Maximum de VUs simultanés

## 🐛 Troubleshooting

### Erreur : "ERRO\[0001\] login failed"

**Cause** : L'utilisateur de test n'a pas pu être créé ou n'existe pas.

**Solution** :
1. Vérifier que l'app est accessible
2. Créer manuellement un utilisateur de test
3. Modifier `testUser` dans le script

### Erreur : "Error: server timeout"

**Cause** : Le serveur ne répond pas assez vite.

**Solution** :
1. Augmenter les ressources serveur
2. Optimiser les requêtes lentes
3. Ajouter du caching

### Taux d'erreur > 5%

**Cause** : Surcharge du serveur ou de la base de données.

**Actions** :
1. Identifier les requêtes en erreur : `grep "status.*50[0-9]" results.json`
2. Vérifier les logs serveur
3. Vérifier la charge DB (CPU, Memory, Connections)
4. Ajouter des indexes sur colonnes fréquemment requêtées

### p(95) > 500ms

**Cause** : Requêtes lentes.

**Actions** :
1. Identifier les endpoints lents
2. Profiler les queries Prisma
3. Ajouter du caching (Redis)
4. Optimiser les queries N+1

## 📊 Options avancées

### Ramp-up personnalisé

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 200 },  // Stress test: 200 users
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};
```

### Différents scénarios

```javascript
export const options = {
  scenarios: {
    constant_users: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
    },
    ramping_vus: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
    },
  },
};
```

### Intégration CI/CD

Ajouter dans `.github/workflows/load-test.yml` :

```yaml
name: Load Test

on:
  schedule:
    - cron: '0 2 * * 0' # Weekly on Sunday at 2am

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run load test
        run: k6 run --env BASE_URL=${{ secrets.STAGING_URL }} tests/load/load-test-simple.js

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: results.json
```

## 📝 Documentation

- [k6 Documentation officielle](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/running-large-tests/)

## 🎯 Objectifs Phase 4

- ✅ Supporter 100 utilisateurs concurrents
- ✅ p(95) response time < 500ms
- ✅ Error rate < 5%
- ✅ Documenter résultats dans `docs/deployment/LOAD_TEST_RESULTS.md`

---

**Version:** 1.0
**Dernière mise à jour:** Janvier 2026
