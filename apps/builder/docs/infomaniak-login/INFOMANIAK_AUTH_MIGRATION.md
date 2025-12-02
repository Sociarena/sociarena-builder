# Migration vers l'authentification Infomaniak OIDC

## Résumé des modifications

Cette migration remplace l'authentification Google et GitHub par l'authentification Infomaniak via OpenID Connect (OIDC).

## Fichiers créés

1. **`apps/builder/app/services/oidc.server.ts`**

   - Service de gestion de l'authentification OIDC avec Infomaniak
   - Fonctions : `getOIDCClient()`, `getAuthorizationUrl()`, `handleCallback()`

2. **`apps/builder/app/routes/auth.infomaniak.tsx`**

   - Route d'initialisation de l'authentification Infomaniak
   - Génère l'URL d'autorisation et redirige vers Infomaniak

3. **`apps/builder/app/routes/auth.infomaniak_.callback.tsx`**
   - Route de callback après authentification
   - Échange le code d'autorisation contre les tokens
   - Crée ou connecte l'utilisateur dans la base de données

## Fichiers modifiés

1. **`apps/builder/app/env/env.server.ts`**

   - Suppression : `GH_CLIENT_ID`, `GH_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Ajout : `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_REDIRECT_URI`, `OIDC_SCOPES`

2. **`apps/builder/app/services/auth.server.ts`**

   - Suppression des imports `GitHubStrategy`, `GoogleStrategy`
   - Suppression des stratégies Google et GitHub
   - Suppression de `callbackOrigin` et `strategyCallback`

3. **`apps/builder/app/shared/session/use-login-error-message.ts`**

   - Remplacement : `LOGIN_GITHUB` et `LOGIN_GOOGLE` par `LOGIN_INFOMANIAK`
   - Mise à jour des messages d'erreur

4. **`apps/builder/app/shared/router-utils/path-utils.ts`**

   - Mise à jour des types de provider : `"infomaniak"` au lieu de `"google" | "github"`

5. **`apps/builder/app/shared/db/user.server.ts`**

   - Suppression des imports `GitHubProfile`, `GoogleProfile`
   - Ajout de l'interface `OAuthProfile` générique
   - Mise à jour de `createOrLoginWithOAuth` pour accepter `OAuthProfile`

6. **`apps/builder/app/auth/login.tsx`**

   - Suppression des boutons Google et GitHub
   - Ajout du bouton "Sign in with Infomaniak"
   - Ajout d'un simple icône Infomaniak (SVG)

7. **`apps/builder/app/routes/_ui.login._index.tsx`**

   - Remplacement : `isGithubEnabled`, `isGoogleEnabled` par `isInfomaniakEnabled`

8. **`docker-compose.yml`**
   - Configuration des variables d'environnement OIDC

## Variables d'environnement requises

```env
OIDC_ISSUER=https://login.infomaniak.com
OIDC_CLIENT_ID=<votre_client_id>
OIDC_CLIENT_SECRET=<votre_client_secret>
OIDC_REDIRECT_URI=https://builder.sociarena.com/auth/infomaniak/callback
OIDC_SCOPES=openid profile email
```

## Configuration Infomaniak

### Sur le portail Infomaniak :

1. Créez une application OAuth2/OpenID Connect
2. Configurez l'URL de redirection : `https://builder.sociarena.com/auth/infomaniak/callback`
3. Récupérez le `client_id` et `client_secret`
4. Configurez les scopes : `openid profile email`

### Endpoints OIDC Infomaniak :

- **Issuer** : `https://login.infomaniak.com`
- **Authorization** : `https://login.infomaniak.com/authorize`
- **Token** : `https://login.infomaniak.com/token`
- **UserInfo** : `https://login.infomaniak.com/userinfo`
- **Discovery** : `https://login.infomaniak.com/.well-known/openid-configuration`

## Déploiement

### 1. Rebuild de l'image Docker

```bash
docker compose build --no-cache
```

### 2. Démarrage du service

```bash
docker compose up -d
```

### 3. Vérification des logs

```bash
docker compose logs -f webstudio
```

## Flux d'authentification

1. **Login** : L'utilisateur clique sur "Sign in with Infomaniak"

   - `POST /auth/infomaniak`
   - Génération de `state`, `nonce`, `codeVerifier`
   - Stockage en session
   - Redirection vers Infomaniak

2. **Callback** : Infomaniak redirige vers l'application

   - `GET /auth/infomaniak/callback?code=...&state=...`
   - Validation du `state`
   - Échange du `code` contre les tokens (avec PKCE)
   - Récupération du profil utilisateur
   - Création ou connexion de l'utilisateur
   - Redirection vers le dashboard

3. **Session** : L'utilisateur est connecté
   - Les données de session contiennent : `userId`, `createdAt`

## Sécurité

- **PKCE (Proof Key for Code Exchange)** : Protection contre les attaques par interception du code
- **State parameter** : Protection contre les attaques CSRF
- **Nonce** : Protection contre les attaques par rejeu (replay attacks)
- **HTTPS uniquement** : Toutes les communications sont chiffrées

## Dépendances

Le package `openid-client` (v6.8.1) est déjà installé dans `apps/builder/package.json`.

## Tests

1. Accédez à `https://builder.sociarena.com/login`
2. Cliquez sur "Sign in with Infomaniak"
3. Connectez-vous avec vos identifiants Infomaniak
4. Vérifiez que vous êtes redirigé vers le dashboard
5. Vérifiez que votre profil est créé dans la base de données

## Rollback

En cas de problème, pour revenir à l'ancienne version :

```bash
git revert <commit_hash>
docker compose build --no-cache
docker compose up -d
```

## Support

Pour toute question ou problème, consultez :

- Documentation Infomaniak OAuth : https://developer.infomaniak.com/docs/api
- Documentation openid-client : https://github.com/panva/node-openid-client
