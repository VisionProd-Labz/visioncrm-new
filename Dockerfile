# Multi-stage build pour optimiser la taille de l'image
FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Image Python pour le backend
FROM python:3.11-slim

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Création de l'utilisateur non-root
RUN groupadd -r visioncrm && useradd -r -g visioncrm visioncrm

WORKDIR /app

# Installation des dépendances Python
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copie du code source
COPY --chown=visioncrm:visioncrm . .

# Copie des assets frontend buildés
COPY --from=frontend-builder --chown=visioncrm:visioncrm /app/static/dist ./static/dist

# Configuration des permissions
RUN chown -R visioncrm:visioncrm /app

USER visioncrm

# Exposition du port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python manage.py check --deploy || exit 1

# Commande de démarrage
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "visioncrm.wsgi:application"]
