# Corgi Chat Migration — Agent Prompts

Step-by-step prompts for migrating `corgi-chat` from the legacy stack (CRA, mesh WebRTC, Socket.IO, Firebase) to a modern monorepo (Next.js, LiveKit, Supabase, Tauri desktop).

## How to use

1. Read `00-orchestrator.md` once to understand the full migration.
2. Run phases **in order**. Do not skip prerequisites.
3. For each phase, copy the prompt block into a **new Cursor Cloud Agent session** (or Agent chat with full repo access).
4. The agent must complete the **Verification checklist** before handing off.
5. After verification passes, run the **Handoff** section to start the next phase.

## Phase index

| Phase | File | Outcome |
|-------|------|---------|
| 0 | [phases/00-foundation.md](phases/00-foundation.md) | Turborepo monorepo scaffold |
| 1 | [phases/01-auth-rooms.md](phases/01-auth-rooms.md) | Auth + room lobby |
| 2 | [phases/02-video-livekit.md](phases/02-video-livekit.md) | LiveKit video calls |
| 3 | [phases/03-persistent-chat.md](phases/03-persistent-chat.md) | Postgres-backed chat |
| 4 | [phases/04-activities.md](phases/04-activities.md) | Collaborative activities |
| 5 | [phases/05-polish-cutover.md](phases/05-polish-cutover.md) | Production cutover |
| 6 | [phases/06-desktop-tauri.md](phases/06-desktop-tauri.md) | Tauri desktop app |

## Parallel work

- **Phase 6** can start after **Phase 2** completes (desktop needs video, not chat/activities).
- Phases 3 and 4 can overlap with Phase 6 if different agents own different workstreams.

- Supporting files

- [templates/phase-prompt-template.md](templates/phase-prompt-template.md) — template for writing new phase prompts
- [reference/target-architecture.md](reference/target-architecture.md) — stack decisions and monorepo layout
- [reference/legacy-inventory.md](reference/legacy-inventory.md) — what to port vs retire from `packages/client`
- [reference/activity-data-channel.md](reference/activity-data-channel.md) — LiveKit activity message schema
- [reference/cutover-checklist.md](reference/cutover-checklist.md) — production deploy / DNS cutover steps

## Conventions for all agents

- **Branch naming:** `cursor/<phase-short-name>-e8a0` (e.g. `cursor/phase-02-livekit-e8a0`)
- **Base branch:** `main`
- **Package manager (new code):** pnpm
- **Do not modify** `legacy/` except when explicitly told to delete it in Phase 5
- **Commit often** with descriptive messages; push before running verification
- **Open or update a PR** at the end of each phase
