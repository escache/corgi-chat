# Quick Copy — Phase Prompts

One-line pointers for starting each agent session. Open the linked file and copy the full **PROMPT START → PROMPT END** block.

| Step | Command to agent |
|------|------------------|
| Start / resume | "Run `docs/migration/00-orchestrator.md` — inspect repo and execute the next incomplete phase." |
| Phase 0 | "Execute `docs/migration/phases/00-foundation.md` exactly." |
| Phase 1 | "Execute `docs/migration/phases/01-auth-rooms.md` exactly." |
| Phase 2 | "Execute `docs/migration/phases/02-video-livekit.md` exactly." |
| Phase 3 | "Execute `docs/migration/phases/03-persistent-chat.md` exactly." |
| Phase 4 | "Execute `docs/migration/phases/04-activities.md` exactly." |
| Phase 5 | "Execute `docs/migration/phases/05-polish-cutover.md` exactly." |
| Phase 6 | "Execute `docs/migration/phases/06-desktop-tauri.md` exactly." |
| Verify | "Run `docs/migration/prompts/verify-phase.md` for Phase {N}." |
| Resume | "Run `docs/migration/prompts/resume.md` for Phase {N} on branch {branch}." |

## Example: kick off migration

```
Read and execute docs/migration/phases/00-foundation.md.
Follow every task in order. Do not skip verification.
Branch: cursor/phase-00-foundation-e8a0
Base: main
```

## Example: parallel desktop track

After Phase 2 passes verification:

```
Read and execute docs/migration/phases/06-desktop-tauri.md.
Web phases 3–5 may still be in progress — only work in apps/desktop and packages/core platform adapter.
Branch: cursor/phase-06-desktop-e8a0
```

## Example: verify before proceeding

```
Read and execute docs/migration/prompts/verify-phase.md.
Verify Phase 2 (LiveKit video). Do not start Phase 3 unless all checks pass.
```
