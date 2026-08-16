function base64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  if (typeof window === "undefined") {
    throw new Error("apiFetch must be used in the browser");
  }

  const current = new URL(window.location.href);
  const url = `${current.protocol}//${current.host}${input}`;

  const headers = new Headers(init?.headers);
  if (current.username || current.password) {
    const credentials = `${current.username}:${current.password}`;
    headers.set("Authorization", `Basic ${base64(credentials)}`);
  }

  return fetch(url, { ...init, headers });
}
