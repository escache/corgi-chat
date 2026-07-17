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
# Fill in DATABASE_URL in apps/web/.env.local
pnpm db:push
pnpm dev
```

Open http://localhost:3000

### Clerk authentication

The app is already wired for Clerk (`@clerk/nextjs`, sign-in/sign-up routes, auth header).
To link your Clerk app and pull API keys, run:

```bash
pnpm setup:clerk
```

This runs `scripts/setup-clerk.sh`, which:

1. Installs or updates the [Clerk CLI](https://clerk.com/docs/cli)
2. Runs `clerk auth login` (browser OAuth — complete in your browser)
3. Runs `clerk init --app app_3Ft5xpoyXsOPw6zYR2vgn6XLas0`
4. Verifies the Next.js middleware matcher includes `'/__clerk/:path*'`
5. Runs `clerk doctor`

Without Clerk keys, the app runs in **guest-only preview mode** (continue as guest on the home page).

Manual alternative:

```bash
export PATH="$HOME/.local/bin:$PATH"
clerk auth login
clerk init --app app_3Ft5xpoyXsOPw6zYR2vgn6XLas0
clerk env pull   # from apps/web/
clerk doctor
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js web app |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run unit tests |
| `pnpm db:push` | Push Drizzle schema to Postgres |
| `pnpm setup:clerk` | Install Clerk CLI, link app, pull keys |
| `pnpm legacy:start` | Start legacy CRA + Socket.IO (deprecated) |

## Migration status

| Phase | Status |
|-------|--------|
| 0 Foundation | Complete |
| 1 Auth & Rooms | Complete |
| 2 LiveKit video | Complete |
| 3 Persistent chat | Complete |
| 4 Activities | Complete |
| 5 Cutover | Pending |
| 6 Desktop (Tauri) | Pending |

See `docs/migration/` for agent prompts to continue the migration.

## License

MIT — original corgi video chat by [getcorgi/corgi](https://github.com/getcorgi/corgi).
