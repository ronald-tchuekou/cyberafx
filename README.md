# CyberAFX

Plateforme de signaux de trading, mentorat, copy trading, trade pools et communautés.

**Stack** : Next.js 16 (App Router, `src/`), Tailwind CSS 4 + shadcn/ui, Neon Postgres + Drizzle ORM, Clerk (auth), Zod + react-hook-form, `@t3-oss/env-nextjs`.
**Rôles** : `admin` et `user` (colonne `users.role`). L'espace admin est `/operator`.

## Démarrage

```bash
cp .env.example .env.local   # renseigner DATABASE_URL (Neon) et les clés Clerk
pnpm install
pnpm db:push                 # crée le schéma (ou db:generate + db:migrate)
pnpm db:seed                 # offres, stratégie, communauté, pool, signaux de DÉMO
pnpm dev
```

Le premier admin : mettez son email dans `ADMIN_EMAILS` ; il reçoit le rôle `admin` à sa première connexion. Ensuite il peut promouvoir d'autres utilisateurs dans `/operator/users`.
Configurez l'adresse USDT dans `/operator/settings` (affichée dans les dialogues de paiement).

## Architecture (par features)

```
src/
  app/            routes fines : /, /auth, /client/*, /operator/*, /api/chat/*
  features/       landing, auth, packages, subscriptions, payments, signals, chart,
                  copytrading, pools, communities, chat, support, notifications, settings, users, admin
                  (chaque feature : schemas/ · queries/ · actions/ · components/)
  components/     ui (shadcn) + shared (shell, champs, dialogues admin)
  db/             schema Drizzle, client Neon, seed
  lib/ hooks/     createAction (server actions Zod), useActionForm (RHF + Zod)
  env.ts          variables d'environnement validées
  proxy.ts        protection optimiste /client et /operator (Clerk)
```

## Ce qui est simulé

- **Paiements USDT** : le client colle son hash, un admin l'approuve (aucune vérification on-chain).
- **Telegram, Exness, copy trading** : identifiants stockés en base, aucun appel externe.
- **Graphique / analyse IA** : bougies simulées (pas de flux marché), scan SMC calculé en code (`features/chart/lib/smc.ts`).
- **Données de seed** : signaux et stats fictifs, à remplacer avant production.

`pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build`

## Sécurité

- **CSP stricte avec nonce** par requête (`src/proxy.ts`, via `clerkMiddleware`) + en-têtes (HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP) dans `next.config.ts`. `ClerkProvider` est en mode `dynamic` : c'est ce qui applique le nonce aux scripts Clerk.
- **Autorisation côté serveur** : toute server action passe par `createAction` (session + rôle + validation Zod) ; les routes API et pages admin revérifient le rôle. Le middleware n'est qu'une première barrière.
- **Rôle admin** : donné par `ADMIN_EMAILS` **uniquement si l'email est vérifié chez Clerk**.
- **Paiements** : chaque hash USDT est consommable une seule fois, tous produits confondus (`payment_hashes`) ; les validations admin sont des mises à jour conditionnelles atomiques (pas de double approbation).
- **Limites de débit** : 5 messages / 10 s en chat, 3 soumissions de paiement / minute (basées sur la base de données, sans Redis).
- Les liens des réglages sont limités à `https://`, l'adresse USDT est validée selon le réseau.

## SEO

`NEXT_PUBLIC_SITE_URL` (URL canonique, ex. `https://www.cyberafx.com`) alimente canonical, sitemap, robots et Open Graph.
Métadonnées par page, `robots.txt`, `sitemap.xml`, `manifest`, icônes et image Open Graph générées, JSON-LD (Organization, WebSite, FAQPage, offres), pages légales. Les zones `/client`, `/operator`, `/auth` et `/api` sont en `noindex`.
Les pages légales (`src/features/legal/data.ts`) sont des **modèles** à faire relire par un juriste.

## Accessibilité & performance

Libellés reliés aux champs (`Field`), lien d'évitement, landmarks, contrastes AA, `prefers-reduced-motion`, boîtes de confirmation accessibles. Lectures publiques (offres, signaux gratuits, réglages) mises en cache et invalidées par tag à chaque action admin ; chat en polling suspendu quand l'onglet est caché ; squelettes de chargement et pages d'erreur par zone.
