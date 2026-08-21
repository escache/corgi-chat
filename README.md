# Corgi Chat

Free and secure video hangouts for everyone.

This repo is migrating from the legacy CRA + mesh WebRTC stack to a modern Turborepo monorepo.

## Monorepo layout

```
apps/web/          Next.js 15 app (new)
apps/desktop/      Tauri 2 + Vite desktop client (new)
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
- Rust + Cargo (for desktop builds)
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
| `pnpm --filter @corgi-chat/web test:e2e` | Playwright e2e (home smoke) |
| `pnpm db:push` | Push Drizzle schema to Postgres |
| `pnpm setup:clerk` | Install Clerk CLI, link app, pull keys |
| `pnpm legacy:start` | Start legacy CRA + Socket.IO (deprecated) |
| `pnpm desktop:dev` | Start Tauri desktop app in dev mode |
| `pnpm desktop:build` | Build Tauri desktop installable artifact |
| `pnpm desktop:preview` | Preview the built desktop frontend |

## Desktop app

The desktop client is in `apps/desktop/` and reuses `packages/ui` and `packages/core`.

```bash
# Install Rust + Tauri CLI if needed
# https://tauri.app/start/prerequisites/
cd apps/desktop
pnpm install
cp .env.example .env
# Fill VITE_API_BASE_URL and VITE_SUPABASE_URL (see .env.example)
pnpm desktop:dev
```

### Desktop authentication

The desktop app supports the same **guest** flow as the web app: a display name creates a guest session and stores the returned token in memory. The `Authorization: Bearer <guestToken>` header is sent with every API request, so the desktop client can call the deployed web API across origins.

For **Clerk**, the recommended Tauri approach is to authenticate the user in a system browser or an in-app webview, capture the Clerk session token from the OAuth callback (deep link `corgi-chat://callback?token=...`), and set it with `setAuthToken(token)`. This requires a small server endpoint to exchange or validate the token.

### Desktop build

```bash
pnpm desktop:build
```

This builds the Vite frontend and the Tauri Rust binary. The first build downloads the Tauri CLI and compiles Rust, so it may take several minutes. To package an installable `.app`/`.msi`, set `bundle.active: true` in `apps/desktop/src-tauri/tauri.conf.json` and add icon files. Generate icons from a source PNG with:

```bash
pnpm --filter @corgi-chat/desktop tauri icon /path/to/icon.png
```

## Deploy

See `docs/migration/reference/cutover-checklist.md` and root `vercel.json`.

## Migration status

| Phase | Status |
|-------|--------|
| 0 Foundation | Complete |
| 1 Auth & Rooms | Complete |
| 2 LiveKit video | Complete |
| 3 Persistent chat | Complete |
| 4 Activities | Complete |
| 5 Cutover | In progress (polish; legacy delete deferred) |
| 6 Desktop (Tauri) | In progress (scaffold; bundle/icons pending) |

See `docs/migration/` for agent prompts to continue the migration.

## License

MIT — original corgi video chat by [getcorgi/corgi](https://github.com/getcorgi/corgi).
