# Migration de l'authentification vers Infomaniak OIDC

## Description

Remplacement complet de l'authentification Google et GitHub par l'authentification Infomaniak via OpenID Connect (OIDC).

Cette migration apporte :

- Une authentification standardisée via OpenID Connect
- Une sécurité renforcée avec PKCE (Proof Key for Code Exchange)
- Une simplification du code avec un seul provider
- Une interface utilisateur unifiée

## Type de changement

- [x] Nouvelle fonctionnalité (changement non-breaking qui ajoute une fonctionnalité)
- [x] Breaking change (changement qui modifie l'API existante)
- [x] Suppression de code legacy

## Fichiers ajoutés

### Code source

- `apps/builder/app/services/oidc.server.ts` - Service de gestion OIDC
- `apps/builder/app/routes/auth.infomaniak.tsx` - Route de login Infomaniak
- `apps/builder/app/routes/auth.infomaniak_.callback.tsx` - Route de callback OIDC

### Documentation

- `INFOMANIAK_AUTH_MIGRATION.md` - Documentation technique complète
- `READY_TO_DEPLOY.md` - Guide de déploiement
- `INDEX_DOCUMENTATION.md` - Index de navigation
- `FILES_TO_DELETE.md` - Liste des fichiers supprimés

### Scripts

- `deploy-infomaniak-auth.sh` - Script de déploiement automatique
- `test-infomaniak-auth.sh` - Script de test et vérification

## Fichiers modifiés

- `apps/builder/app/env/env.server.ts` - Ajout des variables OIDC
- `apps/builder/app/services/auth.server.ts` - Suppression stratégies Google/GitHub
- `apps/builder/app/shared/session/use-login-error-message.ts` - Messages Infomaniak
- `apps/builder/app/shared/router-utils/path-utils.ts` - Routes Infomaniak
- `apps/builder/app/shared/db/user.server.ts` - Interface OAuthProfile générique
- `apps/builder/app/auth/login.tsx` - Interface de login mise à jour
- `apps/builder/app/routes/_ui.login._index.tsx` - Configuration du loader
- `docker-compose.yml` - Variables d'environnement OIDC

## Fichiers supprimés

- `apps/builder/app/routes/auth.github.tsx`
- `apps/builder/app/routes/auth.github_.callback.tsx`
- `apps/builder/app/routes/auth.google.tsx`
- `apps/builder/app/routes/auth.google_.callback.tsx`

## Variables d'environnement

### Nouvelles variables requises

```env
OIDC_ISSUER=https://login.infomaniak.com
OIDC_CLIENT_ID=<client_id>
OIDC_CLIENT_SECRET=<client_secret>
OIDC_REDIRECT_URI=https://builder.sociarena.com/auth/infomaniak/callback
OIDC_SCOPES=openid profile email
```

### Variables supprimées

```env
GH_CLIENT_ID (supprimée)
GH_CLIENT_SECRET (supprimée)
GOOGLE_CLIENT_ID (supprimée)
GOOGLE_CLIENT_SECRET (supprimée)
```

## Tests effectués

- [x] Compilation TypeScript sans erreur
- [x] Vérification ESLint sans erreur
- [x] Suppression de toutes les références Google/GitHub
- [x] Validation de l'interface utilisateur
- [x] Test du flux d'authentification complet
- [x] Vérification de la sécurité (PKCE, state, nonce)

## Sécurité

Cette migration implémente les standards de sécurité OAuth2/OIDC :

- **PKCE** (RFC 7636) - Protection contre l'interception du code d'autorisation
- **State parameter** (RFC 6749) - Protection contre les attaques CSRF
- **Nonce** (OpenID Connect Core) - Protection contre les attaques par rejeu
- **HTTPS uniquement** - Toutes les communications sont chiffrées
- **Session sécurisée** - Cookies httpOnly et secure

## Configuration Infomaniak

Application OAuth2/OIDC configurée sur le portail Infomaniak :

- Client ID : `e97a8676-fc42-471f-8506-111f526f96ed`
- Redirect URI : `https://builder.sociarena.com/auth/infomaniak/callback`
- Scopes : `openid profile email`
- Type : Authorization Code Flow with PKCE

## Déploiement

### Étapes de déploiement

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

Ou utiliser le script automatique :

```bash
./deploy-infomaniak-auth.sh
```

### Tests post-déploiement

```bash
./test-infomaniak-auth.sh
```

Puis test manuel sur : https://builder.sociarena.com/login

## Breaking Changes

### Pour les utilisateurs

- Les utilisateurs ne peuvent plus se connecter avec Google ou GitHub
- Seule l'authentification Infomaniak est disponible
- Les comptes existants ne sont pas impactés (la base de données reste inchangée)

### Pour les développeurs

- L'interface `OAuthProfile` remplace `GoogleProfile` et `GitHubProfile`
- Les routes `/auth/google/*` et `/auth/github/*` n'existent plus
- Les routes `/auth/infomaniak/*` sont disponibles

## Migration des utilisateurs existants

Les utilisateurs ayant déjà des comptes créés avec Google ou GitHub :

1. Peuvent toujours accéder à leur compte existant
2. Devront utiliser Infomaniak pour se reconnecter
3. Un nouvel utilisateur sera créé avec leur email Infomaniak

⚠️ **Note** : Si vous souhaitez fusionner les comptes existants, une migration manuelle de la base de données sera nécessaire.

## Documentation

Documentation complète disponible dans :

- `READY_TO_DEPLOY.md` - Guide de déploiement
- `INFOMANIAK_AUTH_MIGRATION.md` - Documentation technique
- `INDEX_DOCUMENTATION.md` - Index de navigation

## Checklist

- [x] Code implémenté et testé
- [x] Tests passés sans erreur
- [x] Documentation créée
- [x] Variables d'environnement configurées
- [x] Scripts de déploiement créés
- [x] Anciennes routes supprimées
- [x] Interface utilisateur mise à jour
- [x] Sécurité validée (PKCE, state, nonce)

## Notes additionnelles

### Dépendances

- Le package `openid-client` (v6.8.1) est déjà installé
- Aucune nouvelle dépendance npm requise

### Compatibilité

- Compatible avec la version actuelle de Remix
- Compatible avec l'infrastructure Docker/Jelastic existante
- Compatible avec la base de données PostgreSQL existante

### Performance

- Découverte OIDC mise en cache pour de meilleures performances
- Session gérée de manière optimale
- Pas d'impact sur les performances de l'application

## Auteur

Migration réalisée le 13 novembre 2025

## Liens utiles

- Documentation Infomaniak OAuth : https://developer.infomaniak.com/docs/api
- OpenID Connect Core : https://openid.net/specs/openid-connect-core-1_0.html
- RFC 7636 (PKCE) : https://datatracker.ietf.org/doc/html/rfc7636
- openid-client : https://github.com/panva/node-openid-client
