import type {
  CreateRoomInput,
  JoinRoomResponse,
  RoomDetails,
  RoomSummary,
} from "./types";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function createRoom(input: CreateRoomInput): Promise<RoomSummary> {
  const response = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<RoomSummary>(response);
}

export async function fetchRoom(slug: string): Promise<RoomDetails> {
  const response = await fetch(`/api/rooms/${slug}`);
  return parseJson<RoomDetails>(response);
}

export async function joinRoom(slug: string, displayName?: string): Promise<JoinRoomResponse> {
  const response = await fetch(`/api/rooms/${slug}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
  return parseJson<JoinRoomResponse>(response);
}

export async function createGuestSession(displayName: string): Promise<{ guestToken: string }> {
  const response = await fetch("/api/guest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
  return parseJson<{ guestToken: string }>(response);
}
