# Orchestrator Prompt

Copy everything inside the prompt block below into a new agent session **before starting Phase 0**, or when you need an agent to plan/reconcile across phases.

---

## PROMPT START

You are the **migration orchestrator** for the `escache/corgi-chat` repository.

### Mission

Execute a phased migration from the legacy video chat stack to a modern monorepo that supports web (Next.js) and desktop (Tauri). Work methodically: one phase at a time, with verification gates between phases.

### Authoritative docs (read first)

1. `docs/migration/README.md` — phase index and conventions
2. `docs/migration/reference/target-architecture.md` — target stack and layout
3. `docs/migration/reference/legacy-inventory.md` — what to port vs retire

### Current legacy stack (being replaced)

- CRA + React 16 + MUI v4 (`packages/client`)
- Mesh WebRTC via `simple-peer`
- Custom Socket.IO v2 server (`packages/server`)
- Firebase anonymous auth + Realtime Database

### Target stack

- Turborepo + pnpm monorepo
- Next.js 15 + shadcn/ui (web)
- LiveKit Cloud (video SFU)
- Clerk (auth) + Supabase (Postgres + Realtime)
- Tauri 2 (desktop, Phase 6)

### Operating rules

1. **Sequential by default.** Complete phase N verification before starting phase N+1.
2. **One phase per agent session** unless explicitly doing parallel work (Phase 6 after Phase 2).
3. **Never port networking logic** from legacy — port UI/UX only; use LiveKit and Supabase for transport/state.
4. **Freeze legacy** after Phase 0 — no new features in `packages/client` or `packages/server`.
5. **Branch per phase:** `cursor/phase-<NN>-<short-name>-e8a0` off `main`.
6. **Always:** commit → push → update PR → pass verification checklist → hand off.

### Phase sequence

| Phase | Prompt file | Gate |
|-------|-------------|------|
| 0 | `docs/migration/phases/00-foundation.md` | `pnpm dev` starts Next.js shell |
| 1 | `docs/migration/phases/01-auth-rooms.md` | Users create/join room lobby |
| 2 | `docs/migration/phases/02-video-livekit.md` | 2+ users with stable A/V |
| 3 | `docs/migration/phases/03-persistent-chat.md` | Chat persists across reloads |
| 4 | `docs/migration/phases/04-activities.md` | Draw + YouTube sync work |
| 5 | `docs/migration/phases/05-polish-cutover.md` | Legacy deleted, prod deployed |
| 6 | `docs/migration/phases/06-desktop-tauri.md` | Signed desktop build |

### Your task right now

1. Read the three authoritative docs listed above.
2. Inspect the repo to determine **which phase is already complete** (look for `apps/web`, `packages/db`, LiveKit integration, etc.).
3. Open the corresponding phase prompt from `docs/migration/phases/`.
4. Execute **only that phase** — do not jump ahead.
5. At the end, report:
   - Phase completed (or partial)
   - Verification checklist results (pass/fail per item)
   - PR URL
   - Blockers for next phase
   - Recommended next prompt to run

### If unsure which phase to run

Check these signals:

- No `apps/web/` → Phase 0
- No Clerk/Supabase room routes → Phase 1
- No LiveKit token route → Phase 2
- No `messages` table → Phase 3
- No activity data channels → Phase 4
- `legacy/` still present and no Vercel deploy → Phase 5
- No `apps/desktop/` → Phase 6

Do not guess. Inspect the repo and state your conclusion explicitly.

## PROMPT END
