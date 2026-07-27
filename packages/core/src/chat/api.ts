import type { ChatMessage, MessagesPage, SendMessageInput } from "./types";

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
  const response = await fetch(`/api/rooms/${slug}/messages${query ? `?${query}` : ""}`);
  return parseJson<MessagesPage>(response);
}

export async function sendMessage(slug: string, input: SendMessageInput): Promise<ChatMessage> {
  const response = await fetch(`/api/rooms/${slug}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<ChatMessage>(response);
}
