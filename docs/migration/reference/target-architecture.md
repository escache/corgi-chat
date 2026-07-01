# Target Architecture Reference

Use this document as shared context across all migration phase prompts.

## Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Turborepo + pnpm workspaces |
| Web app | Next.js 15 (App Router), React 19, TypeScript 5 |
| Desktop | Tauri 2 + Vite |
| Video | LiveKit Cloud (SFU) |
| Auth | Clerk (sync to Supabase via webhook) |
| Database | Supabase Postgres |
| Realtime | Supabase Realtime + LiveKit data channels |
| ORM | Drizzle |
| UI | shadcn/ui + Tailwind CSS |
| State | TanStack Query + Zustand |
| Deploy (web) | Vercel |
| Deploy (desktop) | GitHub Releases + Tauri updater |

## Monorepo layout (target)

```
corgi-chat/
├── apps/
│   ├── web/                 # Next.js 15
│   └── desktop/             # Tauri 2 (Phase 6)
├── packages/
│   ├── ui/                  # Shared React components
│   ├── core/                # Hooks, API client, types, platform adapter
│   ├── db/                  # Drizzle schema + migrations
│   └── config/              # Shared ESLint, TS, Tailwind configs
├── legacy/                  # Frozen old CRA + Socket.IO server (delete Phase 5)
├── docs/migration/          # These prompts
├── turbo.json
└── pnpm-workspace.yaml
```

## API routes (target)

```
POST   /api/rooms
GET    /api/rooms/[slug]
PATCH  /api/rooms/[slug]
POST   /api/rooms/[slug]/join
POST   /api/livekit/token
GET    /api/rooms/[slug]/messages
POST   /api/rooms/[slug]/messages
GET    /api/releases/latest          # desktop only
```

## Database schema (target)

```sql
users          (id, clerk_id, display_name, avatar_url, created_at)
rooms          (id, slug, name, host_id, settings_json, created_at)
room_members   (room_id, user_id, role, joined_at)
messages       (id, room_id, user_id, body, type, metadata_json, created_at)
```

## Retire (do not port logic)

- `packages/server/` Socket.IO server
- `simple-peer` mesh WebRTC
- `useSocketHandler` and signaling socket events
- Firebase Realtime Database
- CRA / `react-scripts`
- Material UI v4 (port UI to shadcn)

## Environment variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# LiveKit
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=

# Giphy (chat)
NEXT_PUBLIC_GIPHY_API_KEY=
```
