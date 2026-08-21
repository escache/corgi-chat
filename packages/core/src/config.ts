/**
 * Global runtime config for shared packages.
 *
 * Each app (web or desktop) sets the API base URL during bootstrap.
 * The value is stored in a module-level variable so `packages/core`
 * fetch helpers can use plain `fetch()` without React context.
 */
let apiBaseUrl = "";
let authToken = "";

export function setApiBaseUrl(url: string) {
  apiBaseUrl = url.replace(/\/$/, "");
}

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

/**
 * Optional auth token (Clerk session token or guest token).
 * The desktop app sets this after signing in or creating a guest session
 * so `packages/core` fetch helpers can include it as an `Authorization` header.
 */
export function setAuthToken(token: string) {
  authToken = token;
}

export function getAuthToken(): string {
  return authToken;
}
