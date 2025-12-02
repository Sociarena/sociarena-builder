# 📚 Index de la documentation - Migration Infomaniak OIDC

## 🚀 Démarrage rapide

**Vous êtes pressé ? Allez directement ici :**

👉 **[READY_TO_DEPLOY.md](READY_TO_DEPLOY.md)** ← COMMENCEZ ICI

---

## 📖 Documentation disponible

### 1️⃣ Pour déployer

- **[READY_TO_DEPLOY.md](READY_TO_DEPLOY.md)** - Instructions de déploiement et tests
  - Guide étape par étape
  - Commandes à exécuter
  - Checklist de validation

### 2️⃣ Pour comprendre

- **[INFOMANIAK_AUTH_MIGRATION.md](INFOMANIAK_AUTH_MIGRATION.md)** - Documentation technique complète
  - Architecture de la solution
  - Détails de l'implémentation
  - Configuration Infomaniak
  - Flux d'authentification

### 3️⃣ Pour nettoyer (déjà fait)

- **[FILES_TO_DELETE.md](FILES_TO_DELETE.md)** - Fichiers supprimés
  - Liste des anciennes routes
  - Vérification des suppressions

---

## 🛠️ Scripts disponibles

### Déploiement

```bash
./deploy-infomaniak-auth.sh
```

Script automatique pour :

- Arrêter le conteneur
- Rebuilder l'image Docker
- Démarrer le nouveau conteneur
- Afficher les logs

### Tests

```bash
./test-infomaniak-auth.sh
```

Script de vérification pour :

- Vérifier le conteneur
- Tester les variables d'environnement
- Vérifier la connectivité
- Tester la découverte OIDC

---

## 📂 Structure des fichiers créés

```
/Users/maximefourna/Code/sociarena-builder/
│
├── 📄 READY_TO_DEPLOY.md           ← COMMENCEZ ICI
├── 📄 INFOMANIAK_AUTH_MIGRATION.md
├── 📄 FILES_TO_DELETE.md
├── 📄 INDEX_DOCUMENTATION.md        (ce fichier)
│
├── 🔧 deploy-infomaniak-auth.sh
├── 🧪 test-infomaniak-auth.sh
│
└── apps/builder/app/
    ├── services/
    │   └── oidc.server.ts           (nouveau)
    │
    └── routes/
        ├── auth.infomaniak.tsx      (nouveau)
        └── auth.infomaniak_.callback.tsx (nouveau)
```

---

## 🎯 Par cas d'usage

### Je veux déployer maintenant

1. Lisez [READY_TO_DEPLOY.md](READY_TO_DEPLOY.md)
2. Exécutez `./deploy-infomaniak-auth.sh`
3. Exécutez `./test-infomaniak-auth.sh`
4. Testez sur https://builder.sociarena.com/login

### Je veux comprendre l'architecture

1. Lisez [INFOMANIAK_AUTH_MIGRATION.md](INFOMANIAK_AUTH_MIGRATION.md)
2. Consultez le code dans `apps/builder/app/services/oidc.server.ts`
3. Étudiez les routes dans `apps/builder/app/routes/`

### Je veux débugger un problème

1. Consultez la section "Dépannage" dans [READY_TO_DEPLOY.md](READY_TO_DEPLOY.md)
2. Exécutez `./test-infomaniak-auth.sh`
3. Consultez les logs : `docker compose logs -f webstudio | grep -i oidc`

### Je veux modifier la configuration

1. Éditez `docker-compose.yml` pour les variables d'environnement
2. Consultez `apps/builder/app/env/env.server.ts` pour les variables disponibles
3. Redéployez avec `./deploy-infomaniak-auth.sh`

---

## 📋 Checklist de déploiement

- [ ] Lire [READY_TO_DEPLOY.md](READY_TO_DEPLOY.md)
- [ ] Vérifier la configuration dans `docker-compose.yml`
- [ ] Exécuter `./deploy-infomaniak-auth.sh`
- [ ] Exécuter `./test-infomaniak-auth.sh`
- [ ] Tester manuellement sur https://builder.sociarena.com/login
- [ ] Vérifier les logs : `docker compose logs -f webstudio`
- [ ] Valider la connexion avec un compte Infomaniak
- [ ] Vérifier la persistence de session

---

## 🔍 Recherche rapide

### Commandes Docker

Voir : [READY_TO_DEPLOY.md](READY_TO_DEPLOY.md) section "Commandes utiles"

### Configuration OIDC

Voir : [INFOMANIAK_AUTH_MIGRATION.md](INFOMANIAK_AUTH_MIGRATION.md) section "Variables d'environnement"

### Flux d'authentification

Voir : [INFOMANIAK_AUTH_MIGRATION.md](INFOMANIAK_AUTH_MIGRATION.md) section "Flux d'authentification"

### Sécurité

Voir : [INFOMANIAK_AUTH_MIGRATION.md](INFOMANIAK_AUTH_MIGRATION.md) section "Sécurité"

### Dépannage

Voir : [READY_TO_DEPLOY.md](READY_TO_DEPLOY.md) section "Dépannage"

---

## 🆘 Besoin d'aide ?

1. **Consultez la documentation** - Toutes les réponses sont là
2. **Exécutez les tests** - `./test-infomaniak-auth.sh`
3. **Vérifiez les logs** - `docker compose logs -f webstudio`
4. **Consultez la doc Infomaniak** - https://developer.infomaniak.com/docs/api

---

## ✅ Résumé

| Documentation                                                | Usage                      |
| ------------------------------------------------------------ | -------------------------- |
| [READY_TO_DEPLOY.md](READY_TO_DEPLOY.md)                     | 🚀 Déploiement et tests    |
| [INFOMANIAK_AUTH_MIGRATION.md](INFOMANIAK_AUTH_MIGRATION.md) | 📚 Documentation technique |
| [FILES_TO_DELETE.md](FILES_TO_DELETE.md)                     | 🗑️ Nettoyage (fait)        |
| `deploy-infomaniak-auth.sh`                                  | 🔧 Script de déploiement   |
| `test-infomaniak-auth.sh`                                    | 🧪 Script de test          |

---

## 🎉 Prêt à déployer !

```bash
cd /Users/maximefourna/Code/sociarena-builder
./deploy-infomaniak-auth.sh
```

**Bonne migration !** 🚀
