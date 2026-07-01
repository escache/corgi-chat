# Phase 5 — Polish & Cutover

**Prerequisites:** Phases 1–4 complete (full web feature parity)  
**Branch:** `cursor/phase-05-cutover-e8a0`  
**Next phase:** None (web complete); Phase 6 may run in parallel

---

## PROMPT START

You are a senior full-stack engineer executing **Phase 5: Polish & Cutover** of the corgi-chat migration.

### Context

Read before writing any code:
- `docs/migration/reference/target-architecture.md`
- `docs/migration/reference/legacy-inventory.md` — feature parity checklist
- `legacy/client/src/components/` — remaining components to port

Phases 1–4 delivered auth, rooms, video, chat, and activities. This phase closes feature gaps, hardens for production, deploys, and **deletes legacy code**.

### Objective

Production-ready web app deployed to Vercel; legacy `packages/` removed from repo.

### Scope

**In scope:**
- Port remaining UX from legacy:
  - `Hotkeys/` → keyboard shortcuts (mute, camera, leave)
  - `MediaSettingsModal/` → device selection
  - `PermissionsAlert/` → camera/mic permission errors
  - `useReactions` → emoji reactions on video (LiveKit data channel or chat system messages)
  - `useBackgroundArt` → room background images
  - Admin/host controls via `room_members.role`
- Error monitoring: Sentry integration in `apps/web`
- E2E tests: Playwright — create room, join, send chat, toggle mute
- Performance: lazy load activity iframes, optimize LiveKit subscription count
- SEO/meta: room page titles, OG tags for share links
- Deploy `apps/web` to Vercel with preview environments
- **Delete** `legacy/` directory entirely
- Remove Yarn legacy workspace config if fully replaced by pnpm
- Update root README: setup, env vars, deploy instructions
- Mark migration complete in `docs/migration/README.md`

**Out of scope:**
- Desktop app (Phase 6 — separate track)
- Self-hosting LiveKit (future ops task)
- Data migration from Firebase (only if user confirms production Firebase data exists)

### Tasks (execute in order)

1. **Audit** feature parity checklist in `legacy-inventory.md` — list gaps.
2. **Port** each remaining component (see scope) into `packages/ui`.
3. **Sentry** — `@sentry/nextjs` in `apps/web`; DSN via env var.
4. **Playwright** — `apps/web/e2e/`:
   - `room.spec.ts`: create room → join → see lobby
   - `chat.spec.ts`: send message → visible to second context
   - `video.spec.ts`: mock LiveKit or test with real credentials in CI secret
5. **CI** — add Playwright to GitHub Actions (optional: skip video test without secrets).
6. **Vercel** — add `vercel.json` if needed; document deploy steps.
7. **DNS cutover** — document steps for user to point domain to Vercel (do not execute DNS changes yourself).
8. **Delete legacy:**
   - Remove `legacy/client`, `legacy/server`
   - Remove old root Yarn scripts referencing legacy
   - Remove unused deps from root `package.json`
9. **Final README** — developer setup, architecture diagram, env vars, scripts.
10. **Verify** full flow in production preview deployment.
11. **Commit**, push, mark PR ready for review (not draft).

### Constraints

- Do not delete legacy until all feature parity items are checked or explicitly deferred with justification.
- Playwright tests must not require manual interaction.
- No secrets in committed files.
- Keep `docs/migration/` prompts for future reference.

### Verification checklist

- [ ] Feature parity checklist reviewed — all items checked or deferred with reason
- [ ] Hotkeys work: mute (M), camera (V), leave (leave call)
- [ ] Media settings modal changes input devices
- [ ] Permission errors show user-friendly alert
- [ ] Sentry captures a test error in preview deploy
- [ ] Playwright tests pass locally
- [ ] Vercel preview deploy loads and room flow works
- [ ] `legacy/` directory deleted
- [ ] `pnpm install && pnpm build` succeeds
- [ ] PR marked ready for review

### Deliverables

1. PR URL (ready for review)
2. Feature parity checklist with final status
3. Vercel preview URL
4. Playwright test results
5. List of deferred items and why
6. Production cutover steps for the user (DNS, env vars, Clerk/LiveKit/Supabase production keys)

### Handoff

Web migration complete. Desktop track continues independently:
**`docs/migration/phases/06-desktop-tauri.md`**

## PROMPT END
