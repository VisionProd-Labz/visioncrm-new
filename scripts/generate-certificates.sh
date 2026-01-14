#!/bin/bash

# Script pour générer des certificats SSL/TLS auto-signés pour le développement
# NE PAS UTILISER EN PRODUCTION - Utiliser des certificats d'une CA reconnue

echo "Génération des certificats SSL/TLS pour VisionCRM..."

# Créer le répertoire pour les certificats
mkdir -p certs

# Générer la clé privée
openssl genrsa -out certs/private-key.pem 2048

# Générer le certificat auto-signé
openssl req -new -x509 -key certs/private-key.pem -out certs/certificate.pem -days 365 \
    -subj "/C=FR/ST=IDF/L=Paris/O=VisionCRM/OU=IT Department/CN=localhost"

# Générer un bundle CA (pour le développement)
cp certs/certificate.pem certs/ca-bundle.pem

echo "Certificats générés dans le répertoire 'certs/'"
echo "⚠️  Ces certificats sont auto-signés et destinés au développement uniquement"
echo "En production, utilisez des certificats d'une autorité de certification reconnue"

# Afficher les informations du certificat
echo ""
echo "Informations du certificat:"
openssl x509 -in certs/certificate.pem -text -noout | grep -E "(Subject:|Not Before:|Not After:)"
