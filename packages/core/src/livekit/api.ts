import { getApiBaseUrl, getAuthToken } from "../config";

function authHeaders(contentType = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function livekitRoomName(slug: string): string {
  return `corgi-${slug}`;
}

export interface LiveKitTokenResponse {
  token: string;
  serverUrl: string;
  roomName: string;
}

export async function fetchLiveKitToken(roomSlug: string): Promise<LiveKitTokenResponse> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/livekit/token`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ roomSlug }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Failed to get video token (${response.status})`);
  }

  return response.json() as Promise<LiveKitTokenResponse>;
}
