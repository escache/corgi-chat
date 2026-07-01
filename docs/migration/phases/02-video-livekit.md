# Phase 2 — Video (LiveKit)

**Prerequisites:** Phase 1 complete (rooms + auth work)  
**Branch:** `cursor/phase-02-livekit-e8a0`  
**Next phase:** `03-persistent-chat.md` (or `06-desktop-tauri.md` in parallel)

---

## PROMPT START

You are a senior full-stack engineer executing **Phase 2: Video (LiveKit)** of the corgi-chat migration.

### Context

Read before writing any code:
- `docs/migration/reference/target-architecture.md`
- `docs/migration/reference/legacy-inventory.md`
- `legacy/client/src/components/Group/components/BasicView/` — port layout UX
- `legacy/client/src/components/Group/components/Preview/` — port pre-join preview
- `legacy/client/src/components/Group/components/VideoControls/` — port controls

**Do not read or port** `useSocketHandler`, `onPeerCreated`, or `simple-peer` — LiveKit replaces all of this.

### Objective

Two or more users in a room have stable audio/video and screen sharing via LiveKit SFU.

### Scope

**In scope:**
- `POST /api/livekit/token` — mint LiveKit JWT from Clerk session + room membership
- `packages/ui/room/` components:
  - `preview` — pre-join camera/mic check
  - `video-grid` — tiled layout (port from `TiledVideoLayout`)
  - `pinned-layout` — pinned speaker (port from `PinnedVideoLayout`)
  - `controls` — mute, camera, screen share, leave
  - `sidebar` — participant list from LiveKit events
- `packages/core/livekit` — `useLiveKitRoom`, token fetch hook
- Update `/r/[slug]` — lobby transitions to video room on "Join call"
- Join/leave sounds (port mp3 assets from legacy `public/`)
- LiveKit React components: `@livekit/components-react`, `@livekit/components-styles`

**Out of scope:**
- Persistent chat (Phase 3)
- Activities (Phase 4)
- Deleting legacy server
- Desktop app (can start in parallel after this phase)

### Tasks (execute in order)

1. **Inspect** Phase 1 — confirm room join flow and Clerk auth work.
2. **Install** LiveKit server SDK in `apps/web`; client SDK in `packages/ui`.
3. **Token API** — `POST /api/livekit/token`:
   - Input: `{ roomSlug: string }`
   - Validate user is a `room_member`
   - Return `{ token, serverUrl }` with LiveKit `AccessToken`
   - Grant: `roomJoin`, `canPublish`, `canSubscribe`, `canPublishData`
4. **Room page** — split `/r/[slug]` into states: `lobby` → `preview` → `in-call`
5. **Preview** — `packages/ui/room/preview`:
   - getUserMedia for local preview
   - device selector (mic/camera)
   - "Join" button proceeds to LiveKit connect
6. **In-call UI** — `packages/ui/room/video-room.tsx`:
   - Wrap with `<LiveKitRoom>`
   - Default to tiled grid; toggle pinned layout
   - Port sizing logic from `TiledVideoLayout` / `getVideoDimensions.ts` where useful
7. **Controls** — mute, camera off, screen share, leave call
8. **Sidebar** — participant name, mute/camera indicators from `useParticipants()`
9. **Sounds** — play join/leave on participant connect/disconnect
10. **Error handling** — permissions denied, token failure, disconnect reconnect
11. **Test** with 2–3 browser tabs/users in the same room slug
12. **Commit**, push, update PR

### Constraints

- LiveKit room name MUST map deterministically from room slug (e.g. `corgi-${slug}`).
- Do not add `simple-peer`, `socket.io`, or custom signaling.
- Token route must never expose `LIVEKIT_API_SECRET` to the client.
- Video UI lives in `packages/ui` — not directly in `apps/web` page files.

### Verification checklist

- [ ] User can preview camera/mic before joining
- [ ] Two users see and hear each other in `/r/[slug]`
- [ ] Mute toggles audio for other participants
- [ ] Camera off stops video track
- [ ] Screen share works (Chrome)
- [ ] Tiled layout renders correctly with 2–4 participants
- [ ] Pinned layout can be toggled
- [ ] Leave call returns to lobby without errors
- [ ] `pnpm lint` and `pnpm typecheck` pass
- [ ] PR updated with Phase 2 summary and LiveKit setup notes

### Deliverables

1. PR URL
2. Screenshot or recording description of 2-user test
3. Token API request/response shape (redacted)
4. Verification checklist pass/fail
5. Known limitations (browser support, max participants tested)

### Handoff

**Parallel option:** Phase 6 (desktop) can begin now.

**Sequential next:** `docs/migration/phases/03-persistent-chat.md`

## PROMPT END
