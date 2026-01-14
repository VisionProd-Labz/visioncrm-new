#!/bin/bash

echo "🧪 TEST COMPLET VISIONCRM"
echo "========================="
echo ""

echo "1️⃣ Serveur Next.js..."
if curl -s http://localhost:3010/ > /dev/null 2>&1; then
    echo "   ✅ Serveur actif"
else
    echo "   ❌ Serveur non accessible"
    exit 1
fi

echo ""
echo "2️⃣ Authentification..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/api/auth/session)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ /api/auth/session (200)"
else
    echo "   ❌ /api/auth/session ($STATUS)"
fi

STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/api/auth/csrf)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ /api/auth/csrf (200)"
else
    echo "   ❌ /api/auth/csrf ($STATUS)"
fi

echo ""
echo "3️⃣ Pages principales..."
for page in "/" "/login" "/dashboard"; do
    RESULT=$(curl -s "http://localhost:3010$page" | head -100)
    if echo "$RESULT" | grep -q "DOCTYPE"; then
        echo "   ✅ $page se charge"
    else
        echo "   ❌ $page erreur"
    fi
done

echo ""
echo "4️⃣ Dépendances critiques..."
if [ -d "node_modules/recharts" ]; then
    echo "   ✅ recharts installé"
else
    echo "   ❌ recharts manquant"
fi

if [ -d "node_modules/framer-motion" ]; then
    echo "   ✅ framer-motion installé"
else
    echo "   ❌ framer-motion manquant"
fi

if [ -d "node_modules/@radix-ui/react-dropdown-menu" ]; then
    echo "   ✅ radix-ui installé"
else
    echo "   ❌ radix-ui manquant"
fi

echo ""
echo "========================="
echo "✅ TEST COMPLET TERMINÉ"
echo ""
echo "📍 URL: http://localhost:3010"
echo "📧 Email: demo@visioncrm.app"
echo ""
