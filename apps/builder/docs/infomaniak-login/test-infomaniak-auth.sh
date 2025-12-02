#!/bin/bash

# Script de test de l'authentification Infomaniak OIDC
# Usage: ./test-infomaniak-auth.sh

set -e

echo "🧪 Test de l'authentification Infomaniak OIDC"
echo "=============================================="
echo ""

BASE_URL="https://builder.sociarena.com"
CONTAINER_NAME="webstudio-builder"

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher un succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour afficher un warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "📋 Vérifications préalables..."
echo ""

# 1. Vérifier que le conteneur tourne
echo -n "1. Conteneur Docker actif... "
if docker ps | grep -q "$CONTAINER_NAME"; then
    success "OK"
else
    error "FAIL - Le conteneur n'est pas actif"
    echo "   Lancez: docker compose up -d"
    exit 1
fi

# 2. Vérifier les variables d'environnement
echo -n "2. Variables d'environnement OIDC... "
OIDC_ISSUER=$(docker compose exec -T webstudio printenv OIDC_ISSUER 2>/dev/null || echo "")
OIDC_CLIENT_ID=$(docker compose exec -T webstudio printenv OIDC_CLIENT_ID 2>/dev/null || echo "")
OIDC_CLIENT_SECRET=$(docker compose exec -T webstudio printenv OIDC_CLIENT_SECRET 2>/dev/null || echo "")

if [ -n "$OIDC_ISSUER" ] && [ -n "$OIDC_CLIENT_ID" ] && [ -n "$OIDC_CLIENT_SECRET" ]; then
    success "OK"
    echo "   - OIDC_ISSUER: $OIDC_ISSUER"
    echo "   - OIDC_CLIENT_ID: ${OIDC_CLIENT_ID:0:20}..."
else
    error "FAIL - Variables manquantes"
    exit 1
fi

# 3. Vérifier que le serveur répond
echo -n "3. Serveur accessible... "
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login" | grep -q "200"; then
    success "OK"
else
    warning "FAIL - Le serveur ne répond pas sur $BASE_URL/login"
    echo "   Vérifiez que le serveur est bien démarré"
fi

# 4. Vérifier les logs pour des erreurs OIDC
echo -n "4. Vérification des logs... "
ERROR_COUNT=$(docker compose logs webstudio 2>&1 | grep -i "oidc\|infomaniak" | grep -i "error\|fail" | wc -l | tr -d ' ')
if [ "$ERROR_COUNT" -eq 0 ]; then
    success "OK - Aucune erreur OIDC détectée"
else
    warning "ATTENTION - $ERROR_COUNT erreur(s) détectée(s)"
    echo ""
    echo "   Erreurs récentes:"
    docker compose logs --tail=50 webstudio 2>&1 | grep -i "oidc\|infomaniak" | grep -i "error\|fail" | tail -5
fi

echo ""
echo "📊 Résumé de la configuration:"
echo "   - URL de base: $BASE_URL"
echo "   - Page de login: $BASE_URL/login"
echo "   - Callback URL: $BASE_URL/auth/infomaniak/callback"
echo "   - OIDC Issuer: $OIDC_ISSUER"
echo ""

echo "🧪 Tests manuels à effectuer:"
echo ""
echo "1. Test du login:"
echo "   → Ouvrez $BASE_URL/login"
echo "   → Vérifiez que le bouton 'Sign in with Infomaniak' est présent"
echo "   → Vérifiez qu'il n'y a PAS de bouton Google ou GitHub"
echo ""
echo "2. Test d'authentification:"
echo "   → Cliquez sur 'Sign in with Infomaniak'"
echo "   → Vous devriez être redirigé vers login.infomaniak.com"
echo "   → Connectez-vous avec vos identifiants"
echo "   → Vous devriez être redirigé vers le dashboard"
echo ""
echo "3. Test de session:"
echo "   → Rafraîchissez la page"
echo "   → Vous devriez rester connecté"
echo "   → Naviguez vers différentes pages"
echo ""

echo "📝 Commandes utiles:"
echo "   - Voir logs en temps réel: docker compose logs -f webstudio"
echo "   - Filtrer logs OIDC: docker compose logs -f webstudio | grep -i oidc"
echo "   - Redémarrer: docker compose restart webstudio"
echo ""

# Test de la découverte OIDC
echo "🔍 Test de découverte OIDC Infomaniak:"
echo ""
if command -v curl &> /dev/null; then
    echo -n "   Tentative de récupération de la configuration OIDC... "
    if curl -s "$OIDC_ISSUER/.well-known/openid-configuration" | grep -q "authorization_endpoint"; then
        success "OK"
        echo ""
        echo "   Endpoints découverts:"
        curl -s "$OIDC_ISSUER/.well-known/openid-configuration" | grep -E '"authorization_endpoint"|"token_endpoint"|"userinfo_endpoint"' | sed 's/^/   /'
    else
        warning "FAIL - Impossible de récupérer la configuration"
    fi
else
    warning "curl non disponible, test de découverte ignoré"
fi

echo ""
echo "✅ Tests automatiques terminés!"
echo ""
echo "👉 Ouvrez maintenant votre navigateur sur:"
echo "   $BASE_URL/login"
echo ""

