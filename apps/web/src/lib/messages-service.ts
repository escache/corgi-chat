import { and, desc, eq, lt } from "drizzle-orm";

import { isValidRoomSlug } from "@corgi-chat/core";
import {
  getDb,
  messages,
  roomMembers,
  rooms,
  users,
  type MessageType,
  type User,
} from "@corgi-chat/db";

import { RoomServiceError } from "./rooms-service";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export interface ChatMessageDto {
  id: string;
  roomId: string;
  userId: string | null;
  body: string;
  type: MessageType;
  metadata: Record<string, unknown>;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
}

function toChatMessageDto(message: {
  id: string;
  roomId: string;
  userId: string | null;
  body: string;
  type: MessageType;
  metadataJson: Record<string, unknown> | null;
  createdAt: Date;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
}): ChatMessageDto {
  return {
    id: message.id,
    roomId: message.roomId,
    userId: message.userId,
    body: message.body,
    type: message.type,
    metadata: message.metadataJson ?? {},
    createdAt: message.createdAt.toISOString(),
    author: message.user
      ? {
          id: message.user.id,
          displayName: message.user.displayName,
          avatarUrl: message.user.avatarUrl,
        }
      : null,
  };
}

async function requireRoomMembership(roomId: string, userId: string) {
  const db = getDb();
  const membership = await db.query.roomMembers.findFirst({
    where: and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)),
  });

  if (!membership) {
    throw new RoomServiceError("You must join the room before accessing chat", 403);
  }
}

export async function listRoomMessages(
  slug: string,
  user: User,
  options: { before?: string; limit?: number } = {},
) {
  if (!isValidRoomSlug(slug)) {
    throw new RoomServiceError("Invalid room slug", 400);
  }

  const db = getDb();
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.slug, slug),
  });

  if (!room) {
    throw new RoomServiceError("Room not found", 404);
  }

  await requireRoomMembership(room.id, user.id);

  const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const beforeDate = options.before ? new Date(options.before) : undefined;

  if (beforeDate && Number.isNaN(beforeDate.getTime())) {
    throw new RoomServiceError("Invalid before cursor", 400);
  }

  const rows = await db.query.messages.findMany({
    where: beforeDate
      ? and(eq(messages.roomId, room.id), lt(messages.createdAt, beforeDate))
      : eq(messages.roomId, room.id),
    with: { user: true },
    orderBy: [desc(messages.createdAt)],
    limit,
  });

  const chronological = [...rows].reverse();

  return {
    messages: chronological.map(toChatMessageDto),
    hasMore: rows.length === limit,
  };
}

export async function createRoomMessage(
  slug: string,
  user: User,
  input: {
    body: string;
    type?: MessageType;
    metadata?: Record<string, unknown>;
  },
) {
  if (!isValidRoomSlug(slug)) {
    throw new RoomServiceError("Invalid room slug", 400);
  }

  const trimmedBody = input.body.trim();
  if (!trimmedBody) {
    throw new RoomServiceError("Message body is required", 400);
  }

  if (trimmedBody.length > 4000) {
    throw new RoomServiceError("Message is too long", 400);
  }

  const type = input.type ?? "text";
  if (!["text", "gif", "system"].includes(type)) {
    throw new RoomServiceError("Invalid message type", 400);
  }

  if (type === "system") {
    throw new RoomServiceError("System messages cannot be created via API", 400);
  }

  const db = getDb();
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.slug, slug),
  });

  if (!room) {
    throw new RoomServiceError("Room not found", 404);
  }

  await requireRoomMembership(room.id, user.id);

  const [created] = await db
    .insert(messages)
    .values({
      roomId: room.id,
      userId: user.id,
      body: trimmedBody,
      type,
      metadataJson: input.metadata ?? {},
    })
    .returning();

  const author = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  return toChatMessageDto({
    ...created,
    metadataJson: created.metadataJson,
    user: author ?? null,
  });
}
