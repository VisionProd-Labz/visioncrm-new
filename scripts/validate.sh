#!/bin/bash

echo "🔍 Validation du déploiement..."

# Test de connectivité
echo "📡 Test de connectivité..."
if ! curl -f -s http://localhost/api/health > /dev/null; then
    echo "❌ Service non accessible"
    exit 1
fi

# Test de base de données
echo "🗄️ Test de connexion à la base de données..."
if ! docker exec visioncrm_db mysql -u crm_user -p$DB_PASSWORD -e "SELECT 1" visioncrm_prod > /dev/null 2>&1; then
    echo "❌ Connexion à la base de données échouée"
    exit 1
fi

# Test Redis
echo "🔴 Test de connexion à Redis..."
if ! docker exec visioncrm_redis redis-cli ping > /dev/null; then
    echo "❌ Connexion à Redis échouée"
    exit 1
fi

# Test des logs
echo "📝 Vérification des logs..."
if docker-compose -f docker-compose.prod.yml logs app | grep -q "ERROR"; then
    echo "⚠️ Erreurs détectées dans les logs"
    docker-compose -f docker-compose.prod.yml logs app | grep "ERROR"
fi

echo "✅ Validation terminée avec succès!"
