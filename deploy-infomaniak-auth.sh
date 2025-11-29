#!/bin/bash

# Script de déploiement de l'authentification Infomaniak OIDC
# Usage: ./deploy-infomaniak-auth.sh

set -e

echo "🚀 Déploiement de l'authentification Infomaniak OIDC"
echo "=================================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erreur: docker-compose.yml non trouvé"
    echo "   Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Erreur: Docker n'est pas installé"
    exit 1
fi

# Vérifier que Docker Compose est disponible
if ! docker compose version &> /dev/null; then
    echo "❌ Erreur: Docker Compose n'est pas disponible"
    exit 1
fi

echo "✅ Vérifications préalables OK"
echo ""

# Demander confirmation
echo "⚠️  Cette opération va:"
echo "   - Arrêter le conteneur actuel"
echo "   - Rebuilder l'image Docker (sans cache)"
echo "   - Démarrer le nouveau conteneur"
echo ""
read -p "Continuer? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 0
fi

echo ""
echo "📦 Étape 1/4: Arrêt du conteneur actuel..."
docker compose down

echo ""
echo "🔨 Étape 2/4: Build de l'image Docker (sans cache)..."
docker compose build --no-cache

echo ""
echo "🚀 Étape 3/4: Démarrage du conteneur..."
docker compose up -d

echo ""
echo "📋 Étape 4/4: Vérification des logs..."
echo ""
echo "Logs des 20 dernières lignes:"
echo "----------------------------"
docker compose logs --tail=20 webstudio

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Informations:"
echo "   - URL: https://builder.sociarena.com"
echo "   - Login: https://builder.sociarena.com/login"
echo "   - Container: webstudio-builder"
echo ""
echo "📝 Commandes utiles:"
echo "   - Voir les logs: docker compose logs -f webstudio"
echo "   - Redémarrer: docker compose restart webstudio"
echo "   - Arrêter: docker compose down"
echo "   - Status: docker compose ps"
echo ""
echo "🧪 Test:"
echo "   1. Ouvrez https://builder.sociarena.com/login"
echo "   2. Cliquez sur 'Sign in with Infomaniak'"
echo "   3. Connectez-vous avec vos identifiants Infomaniak"
echo "   4. Vérifiez la redirection vers le dashboard"
echo ""
echo "🎉 Prêt à tester!"

