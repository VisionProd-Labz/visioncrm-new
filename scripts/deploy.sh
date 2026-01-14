#!/bin/bash

set -e

# Configuration
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
REGISTRY="ghcr.io"
IMAGE_NAME="$REGISTRY/$(basename $(git remote get-url origin) .git)"

echo "🚀 Deploying VisionCRM to $ENVIRONMENT..."

# Validation des prérequis
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl n'est pas installé"
    exit 1
fi

# Pull de la dernière image
echo "📦 Pulling image $IMAGE_NAME:$IMAGE_TAG..."
docker pull "$IMAGE_NAME:$IMAGE_TAG"

# Déploiement selon l'environnement
case $ENVIRONMENT in
    "staging")
        echo "🔧 Deploying to staging..."
        kubectl apply -f k8s/staging/
        kubectl set image deployment/visioncrm-web web="$IMAGE_NAME:$IMAGE_TAG" -n staging
        ;;
    "production")
        echo "🔧 Deploying to production..."
        kubectl apply -f k8s/production/
        kubectl set image deployment/visioncrm-web web="$IMAGE_NAME:$IMAGE_TAG" -n production
        ;;
    *)
        echo "❌ Environnement non supporté: $ENVIRONMENT"
        exit 1
        ;;
esac

# Attendre le rollout
echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment/visioncrm-web -n $ENVIRONMENT

# Tests de santé
echo "🏥 Running health checks..."
sleep 30

if [ "$ENVIRONMENT" == "staging" ]; then
    HEALTH_URL="https://staging.visioncrm.example.com/health"
else
    HEALTH_URL="https://visioncrm.example.com/health"
fi

if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
