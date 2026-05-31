# BonPour

Mini-site SvelteKit mobile-first pour créer, partager et suivre des bons numériques.

## Démarrage local

```sh
npm install
npm run db:start
npm run db:migrate
npm run dev
```

La configuration attendue est décrite dans `.env.example`.

## Commandes utiles

```sh
npm run check
npm run lint
npm run test
npm run build
npm run db:generate
npm run auth:schema
```

La génération du schéma Better Auth utilise ponctuellement son CLI via `npx` afin de ne pas installer
son ancienne version de `@better-auth/core` à côté du runtime applicatif.
