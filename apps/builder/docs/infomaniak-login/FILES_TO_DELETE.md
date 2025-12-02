# Fichiers à supprimer (anciennes routes Google/GitHub)

## Routes à supprimer

Ces fichiers ne sont plus nécessaires car l'authentification Google et GitHub a été retirée :

1. `apps/builder/app/routes/auth.github.tsx`

   - Route de login GitHub (à supprimer)

2. `apps/builder/app/routes/auth.github_.callback.tsx`

   - Route de callback GitHub (à supprimer)

3. `apps/builder/app/routes/auth.google.tsx`

   - Route de login Google (à supprimer si elle existe)

4. `apps/builder/app/routes/auth.google_.callback.tsx`
   - Route de callback Google (à supprimer)

## Commandes pour supprimer

```bash
# Depuis la racine du projet
rm -f apps/builder/app/routes/auth.github.tsx
rm -f apps/builder/app/routes/auth.github_.callback.tsx
rm -f apps/builder/app/routes/auth.google.tsx
rm -f apps/builder/app/routes/auth.google_.callback.tsx
```

## Vérification

Après suppression, vérifiez qu'aucune référence ne reste :

```bash
# Rechercher des références à GitHub auth
grep -r "auth.github" apps/builder/app/

# Rechercher des références à Google auth
grep -r "auth.google" apps/builder/app/
```

## ⚠️ Important

NE PAS supprimer les fichiers suivants (ils sont utilisés pour d'autres fonctionnalités) :

- `auth.ws.ts` (authentification WebStudio)
- `auth.ws_.callback.ts` (callback WebStudio)
- `auth.dev.tsx` (authentification développement)

## Dépendances npm à retirer (optionnel)

Si vous souhaitez nettoyer complètement, vous pouvez aussi retirer ces packages du `package.json` :

```bash
cd apps/builder
pnpm remove remix-auth-github remix-auth-google
```

Mais ce n'est pas obligatoire car ils ne sont plus utilisés dans le code.
