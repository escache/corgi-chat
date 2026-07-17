/**
 * Optional Sentry bootstrap. Set SENTRY_DSN to enable.
 * Keeps the app runnable without Sentry configured.
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    });
  } catch {
    console.warn("Sentry DSN set but @sentry/nextjs failed to load");
  }
}
