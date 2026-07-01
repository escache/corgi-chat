# Phase 1 — Auth & Rooms

**Prerequisites:** Phase 0 complete (`apps/web` runs)  
**Branch:** `cursor/phase-01-auth-rooms-e8a0`  
**Next phase:** `02-video-livekit.md`

---

## PROMPT START

You are a senior full-stack engineer executing **Phase 1: Auth & Rooms** of the corgi-chat migration.

### Context

Read before writing any code:
- `docs/migration/reference/target-architecture.md`
- `docs/migration/reference/legacy-inventory.md`
- `legacy/client/src/components/Home/` — port lobby UX from here

Phase 0 delivered the monorepo skeleton. Legacy app is frozen in `legacy/`.

### Objective

Users can sign in, create a room, share a link, and have another user join the **lobby** (no video yet).

### Scope

**In scope:**
- Clerk auth integration in `apps/web`
- Supabase + Drizzle schema: `users`, `rooms`, `room_members`
- Clerk webhook to sync users into Supabase
- API routes: `POST /api/rooms`, `GET /api/rooms/[slug]`, `POST /api/rooms/[slug]/join`
- Pages: `/` (home/lobby), `/r/[slug]` (room lobby — pre-video)
- `packages/ui/lobby` — port Home page UI using shadcn (create room, recent rooms)
- `packages/core/rooms` — hooks: `useCreateRoom`, `useRoom`, `useJoinRoom`
- Row Level Security policies on Supabase tables
- Guest access: allow unauthenticated users to join via signed guest flow OR Clerk guest sessions

**Out of scope:**
- LiveKit / video (Phase 2)
- Chat messages (Phase 3)
- Porting video components
- Desktop app
- Deleting legacy code

### Tasks (execute in order)

1. **Inspect** Phase 0 output — confirm `apps/web`, `packages/db` exist.
2. **Schema** — in `packages/db`, define Drizzle tables:
   - `users` (id uuid PK, clerk_id text unique, display_name, avatar_url, created_at)
   - `rooms` (id uuid PK, slug text unique, name, host_id FK users, settings_json jsonb, created_at)
   - `room_members` (room_id, user_id, role enum host|guest|member, joined_at)
3. **Migration** — add SQL migration file; document `pnpm db:push` or `pnpm db:migrate` script.
4. **Clerk** — install `@clerk/nextjs`; wrap `apps/web` layout with `ClerkProvider`.
5. **Middleware** — protect `/r/[slug]` creation routes; allow public join with guest auth.
6. **Webhook** — `POST /api/webhooks/clerk` syncs `user.created` / `user.updated` to Supabase `users`.
7. **API routes** — implement room CRUD per target-architecture.md.
8. **UI** — build lobby in `packages/ui/lobby`:
   - "Create room" → generates slug, redirects to `/r/[slug]`
   - Room lobby shows name, participant list (from `room_members`), "Waiting for video..." placeholder
   - Port visual style from `legacy/client/src/components/Home/` where sensible
9. **Hooks** — `packages/core/rooms` with TanStack Query wrappers around API routes.
10. **RLS** — Supabase policies: users read rooms they belong to; hosts can update room settings.
11. **Tests** — at minimum: API route unit tests for room creation + slug uniqueness.
12. **Verify** end-to-end in browser with two accounts.
13. **Commit**, push, update PR.

### Constraints

- Slug format: lowercase alphanumeric + hyphens, 6–32 chars, URL-safe.
- Do not use Firebase for any new code.
- Do not add Socket.IO or WebRTC dependencies.
- All new UI uses shadcn/ui + Tailwind — no MUI.
- Store secrets in env vars only; update `.env.example`.

### Verification checklist

- [ ] Signed-in user can create a room from `/`
- [ ] Room URL `/r/[slug]` is shareable
- [ ] Second user (signed in or guest) can join the same room lobby
- [ ] Participant list updates when users join
- [ ] `users` row created in Supabase when Clerk user signs up
- [ ] `pnpm lint` and `pnpm typecheck` pass
- [ ] At least one test passes for room API
- [ ] PR updated with Phase 1 summary

### Deliverables

Report when done:
1. PR URL
2. Schema diagram or table list
3. Manual test steps performed and results
4. Verification checklist pass/fail
5. Env vars the user must set in Vercel/Clerk/Supabase dashboards

### Handoff

When all checks pass, provision **LiveKit Cloud** before Phase 2:
- Create project at https://cloud.livekit.io
- Save `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`

Next agent session: **`docs/migration/phases/02-video-livekit.md`**

## PROMPT END
