import { and, eq } from "drizzle-orm";

import { generateRoomSlug, isValidRoomSlug } from "@corgi-chat/core";
import {
  getDb,
  messages,
  roomMembers,
  rooms,
  users,
  type MemberRole,
  type Room,
  type User,
} from "@corgi-chat/db";

export class RoomServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function toRoomSummary(room: Room) {
  return {
    id: room.id,
    slug: room.slug,
    name: room.name,
    hostId: room.hostId,
    createdAt: room.createdAt.toISOString(),
  };
}

async function createUniqueSlug(name: string): Promise<string> {
  const db = getDb();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const slug = generateRoomSlug(name);
    if (!isValidRoomSlug(slug)) {
      continue;
    }

    const existing = await db.query.rooms.findFirst({
      where: eq(rooms.slug, slug),
    });

    if (!existing) {
      return slug;
    }
  }

  throw new RoomServiceError("Could not generate a unique room slug", 500);
}

export async function createRoomForUser(user: User, name: string) {
  const db = getDb();
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new RoomServiceError("Room name is required", 400);
  }

  const slug = await createUniqueSlug(trimmedName);

  const [room] = await db
    .insert(rooms)
    .values({
      slug,
      name: trimmedName,
      hostId: user.id,
    })
    .returning();

  await db.insert(roomMembers).values({
    roomId: room.id,
    userId: user.id,
    role: "host",
  });

  return toRoomSummary(room);
}

export async function getRoomBySlug(slug: string) {
  if (!isValidRoomSlug(slug)) {
    throw new RoomServiceError("Invalid room slug", 400);
  }

  const db = getDb();
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.slug, slug),
    with: {
      members: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!room) {
    throw new RoomServiceError("Room not found", 404);
  }

  return {
    ...toRoomSummary(room),
    members: room.members.map((membership) => ({
      id: membership.user.id,
      displayName: membership.user.displayName,
      avatarUrl: membership.user.avatarUrl,
      role: membership.role as MemberRole,
    })),
  };
}

export async function joinRoomBySlug(slug: string, user: User, role: MemberRole = "member") {
  const db = getDb();
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.slug, slug),
  });

  if (!room) {
    throw new RoomServiceError("Room not found", 404);
  }

  const existing = await db.query.roomMembers.findFirst({
    where: and(eq(roomMembers.roomId, room.id), eq(roomMembers.userId, user.id)),
  });

  if (!existing) {
    await db.insert(roomMembers).values({
      roomId: room.id,
      userId: user.id,
      role: user.id === room.hostId ? "host" : role,
    });

    await db.insert(messages).values({
      roomId: room.id,
      userId: null,
      body: `${user.displayName} joined the room`,
      type: "system",
      metadataJson: {},
    });
  }

  return {
    room: toRoomSummary(room),
    member: {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: (existing?.role ?? (user.id === room.hostId ? "host" : role)) as MemberRole,
    },
  };
}

export async function upsertClerkUser(input: {
  clerkId: string;
  displayName: string;
  avatarUrl?: string | null;
}) {
  const db = getDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, input.clerkId),
  });

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        displayName: input.displayName,
        avatarUrl: input.avatarUrl ?? null,
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkId: input.clerkId,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl ?? null,
    })
    .returning();

  return created;
}

export async function createGuestUser(displayName: string) {
  const db = getDb();
  const trimmedName = displayName.trim();

  if (!trimmedName) {
    throw new RoomServiceError("Display name is required", 400);
  }

  const guestToken = crypto.randomUUID().replace(/-/g, "");

  const [user] = await db
    .insert(users)
    .values({
      guestToken,
      displayName: trimmedName,
    })
    .returning();

  return { user, guestToken };
}
