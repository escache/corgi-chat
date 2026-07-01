# Phase 0 — Foundation

**Prerequisites:** None (first phase)  
**Branch:** `cursor/phase-00-foundation-e8a0`  
**Next phase:** `01-auth-rooms.md`

---

## PROMPT START

You are a senior full-stack engineer executing **Phase 0: Foundation** of the corgi-chat migration.

### Context

Read before writing any code:
- `docs/migration/reference/target-architecture.md`
- `docs/migration/reference/legacy-inventory.md`

The repo currently contains the legacy app in `packages/client` and `packages/server`. Your job is to scaffold the **new monorepo alongside it** without breaking the legacy app.

### Objective

Create a Turborepo + pnpm monorepo skeleton with a runnable Next.js 15 shell, shared package stubs, and CI — while moving legacy code into `legacy/`.

### Scope

**In scope:**
- Turborepo + pnpm workspace setup
- `apps/web` — Next.js 15, App Router, Tailwind, shadcn/ui initialized
- `packages/ui`, `packages/core`, `packages/db`, `packages/config` — empty stubs with TypeScript configured
- Move `packages/client` → `legacy/client`, `packages/server` → `legacy/server`
- Root `turbo.json`, `pnpm-workspace.yaml`
- `.env.example` with all target env vars (see target-architecture.md)
- GitHub Actions: lint + typecheck on PR
- Update root README with monorepo dev instructions

**Out of scope:**
- Clerk, Supabase, or LiveKit integration (Phase 1+)
- Porting any UI components from legacy
- Deleting legacy code
- Desktop app

### Tasks (execute in order)

1. **Inspect** the repo structure and confirm legacy packages exist.
2. **Install** pnpm at root; add `packageManager` field to root `package.json`.
3. **Create** `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - "apps/*"
     - "packages/*"
     - "legacy/*"
   ```
4. **Move** legacy code:
   - `packages/client` → `legacy/client`
   - `packages/server` → `legacy/server`
   - Update any broken root scripts to point at `legacy/` paths
5. **Scaffold** `apps/web`:
   - Next.js 15, App Router, TypeScript, Tailwind, ESLint
   - `src/app/page.tsx` — placeholder "Corgi Chat — migrating" page
   - `src/app/layout.tsx` — base layout
6. **Scaffold** packages:
   - `packages/config` — shared `tsconfig.base.json`, ESLint config
   - `packages/ui` — empty export, depends on React 19
   - `packages/core` — empty export
   - `packages/db` — Drizzle + Supabase client stub (no schema yet)
7. **Configure** Turborepo `turbo.json` with `build`, `dev`, `lint`, `typecheck` pipelines.
8. **Add** `.env.example` documenting all env vars from target-architecture.md.
9. **Add** `.github/workflows/ci.yml` — run `pnpm lint` and `pnpm typecheck` on PR.
10. **Verify** locally: `pnpm install && pnpm dev` starts the Next.js app on port 3000.
11. **Commit** on branch `cursor/phase-00-foundation-e8a0`, push, open draft PR to `main`.

### Constraints

- Do not remove legacy functionality — `legacy/client` should still be startable if it was before.
- Use React 19 and TypeScript 5 in new packages only; do not upgrade legacy deps.
- Keep the diff focused on scaffolding — no premature feature work.
- Match existing repo conventions for commit messages and PR descriptions.

### Verification checklist

- [ ] `pnpm install` succeeds at repo root
- [ ] `pnpm dev` starts `apps/web` on http://localhost:3000
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes (or `tsc --noEmit` equivalent)
- [ ] `legacy/client` and `legacy/server` exist and paths are correct
- [ ] `.env.example` documents Clerk, Supabase, LiveKit, Giphy vars
- [ ] CI workflow file exists and is valid YAML
- [ ] Draft PR opened to `main`

### Deliverables

Report when done:
1. PR URL
2. New directory tree (top 2 levels)
3. Verification checklist with pass/fail per item
4. Any deviations from the plan and why

### Handoff

When all checks pass, the next agent session should run:
**`docs/migration/phases/01-auth-rooms.md`**

Provision these externally before Phase 1:
- Supabase project (save URL + keys)
- Clerk application (save publishable + secret keys)

## PROMPT END
