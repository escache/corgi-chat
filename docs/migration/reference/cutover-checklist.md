# Production cutover checklist

Use this after Phases 1–4 are merged and Phase 5 polish is verified.

## Do not execute DNS yourself

Point your domain to Vercel only after a preview deploy looks good.

## Environment variables (Vercel)

Copy from `.env.example` into the Vercel project:

- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
- LiveKit: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`
- Giphy: `NEXT_PUBLIC_GIPHY_API_KEY`
- Optional Sentry: `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`

## Deploy

1. Import the GitHub repo in Vercel (root uses `vercel.json`).
2. Set env vars for Preview + Production.
3. Run SQL migrations from `packages/db/supabase/migrations/` in Supabase.
4. Confirm Clerk webhook → `/api/webhooks/clerk`.
5. Smoke-test: create room → chat → optional video → activity.

## Legacy deletion (deferred)

`legacy/` remains until feature parity is signed off. See `docs/migration/reference/legacy-inventory.md`.
