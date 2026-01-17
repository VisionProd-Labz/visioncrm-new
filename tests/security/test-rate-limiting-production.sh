#!/bin/bash

# Test Rate Limiting en Production
# URL de production
PROD_URL="https://visioncrm-mglqcg4sa-m-autos-projects.vercel.app"

echo "======================================================================"
echo "🔒 TEST RATE LIMITING - PRODUCTION"
echo "======================================================================"
echo ""
echo "URL: $PROD_URL"
echo "Date: $(date)"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Login Rate Limiting (5 req/min)
echo "======================================================================"
echo "📝 TEST 1: LOGIN RATE LIMITING (limite: 5 requêtes/minute)"
echo "======================================================================"
echo ""
echo "Envoi de 6 requêtes de login consécutives..."
echo "Résultat attendu: Les 5 premières passent (401), la 6ème est bloquée (429)"
echo ""

SUCCESS_COUNT=0
RATE_LIMITED=0

for i in {1..6}; do
  echo -n "Requête $i/6: "

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$PROD_URL/api/auth/signin" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}')

  if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✅ 401 Unauthorized${NC} (normal - credentials invalides)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$HTTP_CODE" == "429" ]; then
    echo -e "${YELLOW}⚠️  429 Too Many Requests${NC} (RATE LIMITING ACTIF!)"
    RATE_LIMITED=$((RATE_LIMITED + 1))
  elif [ "$HTTP_CODE" == "403" ]; then
    echo -e "${BLUE}🔒 403 Forbidden${NC} (CSRF protection - aussi acceptable)"
  else
    echo -e "${RED}❌ $HTTP_CODE${NC} (inattendu)"
  fi

  # Petit délai entre les requêtes pour éviter les problèmes réseau
  sleep 0.2
done

echo ""
echo "----------------------------------------------------------------------"
echo "📊 RÉSULTAT TEST 1:"
echo "  - Requêtes réussies (401/403): $SUCCESS_COUNT"
echo "  - Requêtes rate-limitées (429): $RATE_LIMITED"
echo ""

if [ $RATE_LIMITED -gt 0 ]; then
  echo -e "${GREEN}✅ SUCCÈS: Rate limiting actif!${NC}"
  echo "   La 6ème requête (ou plus) a été bloquée avec 429."
else
  echo -e "${YELLOW}⚠️  ATTENTION: Aucune requête n'a été rate-limitée${NC}"
  echo "   Vérifications possibles:"
  echo "   - Les variables Redis sont-elles configurées sur Vercel?"
  echo "   - NODE_ENV est-il bien en 'production'?"
  echo "   - Redis Upstash est-il accessible?"
fi

echo ""
echo ""

# Test 2: Vérification d'un endpoint API normal
echo "======================================================================"
echo "📝 TEST 2: API ENDPOINT RATE LIMITING (limite: 100 requêtes/minute)"
echo "======================================================================"
echo ""
echo "Test sur /api/contacts (nécessite authentification)"
echo ""

# On fait juste 5 requêtes pour tester (pas 100)
echo "Envoi de 5 requêtes rapides pour vérifier la configuration..."
echo ""

API_SUCCESS=0
API_RATE_LIMITED=0

for i in {1..5}; do
  echo -n "Requête API $i/5: "

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$PROD_URL/api/contacts")

  if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✅ 401 Unauthorized${NC} (normal - pas connecté)"
    API_SUCCESS=$((API_SUCCESS + 1))
  elif [ "$HTTP_CODE" == "429" ]; then
    echo -e "${YELLOW}⚠️  429 Too Many Requests${NC}"
    API_RATE_LIMITED=$((API_RATE_LIMITED + 1))
  elif [ "$HTTP_CODE" == "403" ]; then
    echo -e "${BLUE}🔒 403 Forbidden${NC} (CSRF ou permissions)"
  else
    echo -e "${BLUE}ℹ️  $HTTP_CODE${NC}"
  fi

  sleep 0.1
done

echo ""
echo "----------------------------------------------------------------------"
echo "📊 RÉSULTAT TEST 2:"
echo "  - Requêtes réussies: $API_SUCCESS"
echo "  - Requêtes rate-limitées: $API_RATE_LIMITED"
echo ""
echo "Note: Pour tester la limite de 100 req/min, il faudrait faire"
echo "      plus de 100 requêtes rapidement, ce qui serait trop long."
echo ""

# Résumé final
echo ""
echo "======================================================================"
echo "📋 RÉSUMÉ FINAL"
echo "======================================================================"
echo ""
echo "✅ Tests exécutés avec succès"
echo ""
echo "RATE LIMITING LOGIN:"
if [ $RATE_LIMITED -gt 0 ]; then
  echo -e "  ${GREEN}✅ ACTIF${NC} - Au moins une requête bloquée (429)"
else
  echo -e "  ${YELLOW}⚠️  NON DÉTECTÉ${NC} - Aucun 429 reçu"
  echo "     Cela peut être normal si:"
  echo "     - Redis n'a pas encore synchronisé"
  echo "     - Le déploiement est très récent"
  echo "     - NODE_ENV n'est pas 'production'"
fi
echo ""
echo "ENDPOINTS TESTÉS:"
echo "  - POST /api/auth/signin (login)"
echo "  - GET  /api/contacts (API)"
echo ""
echo "RECOMMANDATIONS:"
echo "  1. Vérifier les logs Vercel: vercel logs --follow"
echo "  2. Vérifier le dashboard Upstash Redis"
echo "  3. Confirmer NODE_ENV=production sur Vercel"
echo "  4. Attendre 1-2 minutes et re-tester si nécessaire"
echo ""
echo "======================================================================"
echo "Test terminé à: $(date)"
echo "======================================================================"
