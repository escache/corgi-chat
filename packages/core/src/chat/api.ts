import { getApiBaseUrl, getAuthToken } from "../config";

import type { ChatMessage, MessagesPage, SendMessageInput } from "./types";

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

export async function fetchMessages(
  slug: string,
  options: { before?: string; limit?: number } = {},
): Promise<MessagesPage> {
  const params = new URLSearchParams();
  if (options.before) {
    params.set("before", options.before);
  }
  if (options.limit) {
    params.set("limit", String(options.limit));
  }

  const query = params.toString();
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/rooms/${slug}/messages${query ? `?${query}` : ""}`, {
    headers: authHeaders(),
  });
  return parseJson<MessagesPage>(response);
}

export async function sendMessage(slug: string, input: SendMessageInput): Promise<ChatMessage> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/rooms/${slug}/messages`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(input),
  });
  return parseJson<ChatMessage>(response);
}
