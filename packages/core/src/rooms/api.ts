import { getApiBaseUrl, getAuthToken } from "../config";

import type {
  CreateRoomInput,
  JoinRoomResponse,
  RoomDetails,
  RoomSummary,
} from "./types";

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

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function createRoom(input: CreateRoomInput): Promise<RoomSummary> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/rooms`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(input),
  });
  return parseJson<RoomSummary>(response);
}

export async function fetchRoom(slug: string): Promise<RoomDetails> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/rooms/${slug}`, {
    headers: authHeaders(),
  });
  return parseJson<RoomDetails>(response);
}

export async function joinRoom(slug: string, displayName?: string): Promise<JoinRoomResponse> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/rooms/${slug}/join`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ displayName }),
  });
  return parseJson<JoinRoomResponse>(response);
}

export async function createGuestSession(displayName: string): Promise<{ guestToken: string }> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/guest`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ displayName }),
  });
  return parseJson<{ guestToken: string }>(response);
}

export interface CurrentUser {
  userId: string;
  displayName: string;
  isGuest: boolean;
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/me`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    return null;
  }
  return parseJson<CurrentUser>(response);
}
