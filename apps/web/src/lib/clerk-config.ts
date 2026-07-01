/** True when real Clerk API keys are configured (not empty or CI placeholders). */
export function isClerkEnabled(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key || key.includes("placeholder")) {
    return false;
  }

  return /^pk_(test|live)_[A-Za-z0-9]+$/.test(key) && key.length > 24;
}
