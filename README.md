# Corgi Chat

Free and secure video hangouts for everyone.

This repo is migrating from the legacy CRA + mesh WebRTC stack to a modern Turborepo monorepo.

## Monorepo layout

```
apps/web/          Next.js 15 app (new)
legacy/client/     Legacy CRA frontend (frozen)
legacy/server/     Legacy Socket.IO server (frozen)
packages/ui/       Shared UI components
packages/core/     Shared hooks and utilities
packages/db/       Drizzle schema + Postgres client
docs/migration/    Step-by-step agent migration prompts
```

## Prerequisites

- Node.js 22+
- pnpm 9+
- Supabase project (Postgres `DATABASE_URL`)
- Clerk application

## Quick start

```bash
pnpm install
cp .env.example apps/web/.env.local
# Fill in Clerk + DATABASE_URL in apps/web/.env.local
pnpm db:push
pnpm dev
```

Open http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js web app |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run unit tests |
| `pnpm db:push` | Push Drizzle schema to Postgres |
| `pnpm legacy:start` | Start legacy CRA + Socket.IO (deprecated) |

## Migration status

| Phase | Status |
|-------|--------|
| 0 Foundation | Complete |
| 1 Auth & Rooms | Complete |
| 2 LiveKit video | Complete |
| 3 Persistent chat | Pending |
| 4 Activities | Pending |
| 5 Cutover | Pending |
| 6 Desktop (Tauri) | Pending |

See `docs/migration/` for agent prompts to continue the migration.

## License

MIT — original corgi video chat by [getcorgi/corgi](https://github.com/getcorgi/corgi).
