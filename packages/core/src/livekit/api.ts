export function livekitRoomName(slug: string): string {
  return `corgi-${slug}`;
}

export interface LiveKitTokenResponse {
  token: string;
  serverUrl: string;
  roomName: string;
}

export async function fetchLiveKitToken(roomSlug: string): Promise<LiveKitTokenResponse> {
  const response = await fetch("/api/livekit/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomSlug }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Failed to get video token (${response.status})`);
  }

  return response.json() as Promise<LiveKitTokenResponse>;
}
