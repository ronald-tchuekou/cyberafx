# Workflow Git

| Branche | Rôle | Environnement |
| --- | --- | --- |
| `main` | Production | prod |
| `dev` | Développement | dev / staging |
| `feat/…`, `fix/…`, `chore/…` | Une modification | local |

## Règles

1. **Toute modification** se fait sur une branche dédiée créée depuis `dev`, jamais directement sur `dev` ou `main`.
2. La branche est fusionnée dans **`dev`** via une **Pull Request**, puis **supprimée** (suppression automatique à la fusion).
3. **Seule `dev` peut être fusionnée dans `main`**, via une PR `dev` → `main` (release). Le contrôle CI « Only dev can merge into main » bloque toute autre source.
4. La CI (typecheck, lint, tests, build) doit être verte pour fusionner.

## Méthode de fusion

- PR `feat/…` → `dev` : **Squash and merge** (historique de `dev` lisible).
- PR `dev` → `main` : **Create a merge commit** (ne **jamais** squasher : `dev` divergerait de `main`).

## Exemple

```bash
git switch dev && git pull
git switch -c feat/ma-modification
# … commits …
git push -u origin feat/ma-modification
gh pr create --base dev
```

## Base de données

Les migrations Drizzle (`drizzle/`) sont versionnées. En production : `pnpm db:migrate` (jamais `db:push`). Utiliser une base Neon distincte (ou une branche Neon) par environnement.
