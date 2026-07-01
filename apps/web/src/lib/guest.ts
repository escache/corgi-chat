export const GUEST_COOKIE_NAME = "corgi_guest_token";
export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function createGuestToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}
