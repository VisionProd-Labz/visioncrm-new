#!/bin/bash

echo "🔍 VÉRIFICATION COMPLÈTE DE VISIONCRM"
echo "====================================="
echo ""

# 1. Check server
echo "1️⃣ Serveur Next.js"
if curl -s http://localhost:3010/ > /dev/null 2>&1; then
    echo "   ✅ Serveur actif sur http://localhost:3010"
else
    echo "   ❌ Serveur non accessible"
    exit 1
fi

# 2. Check auth endpoints
echo ""
echo "2️⃣ Endpoints d'authentification"
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

# 3. Check pages
echo ""
echo "3️⃣ Pages principales"
for page in "/" "/login"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3010$page")
    if [ "$STATUS" = "200" ]; then
        echo "   ✅ $page (200)"
    else
        echo "   ❌ $page ($STATUS)"
    fi
done

# 4. Check dependencies
echo ""
echo "4️⃣ Dépendances installées"
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules présent"
    echo "   ✅ $(ls node_modules | wc -l) packages installés"
else
    echo "   ❌ node_modules manquant"
fi

# 5. Check Prisma
echo ""
echo "5️⃣ Prisma Client"
if [ -d "node_modules/.prisma/client" ] || [ -d "node_modules/@prisma/client" ]; then
    echo "   ✅ Prisma Client généré"
else
    echo "   ❌ Prisma Client manquant"
fi

# 6. Summary
echo ""
echo "======================================"
echo "✅ VÉRIFICATION TERMINÉE"
echo ""
echo "📌 Informations de connexion:"
echo "   URL: http://localhost:3010/login"
echo "   Email: demo@visioncrm.app"
echo ""
