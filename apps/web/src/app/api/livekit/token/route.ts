import { AccessToken } from "livekit-server-sdk";
import { and, eq } from "drizzle-orm";

import { requireCurrentUser } from "@/lib/auth";
import { getDb, roomMembers, rooms } from "@corgi-chat/db";
import { livekitRoomName } from "@corgi-chat/core";
import * as cors from "@/lib/cors";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as { roomSlug?: string };
    const roomSlug = body.roomSlug?.trim();

    if (!roomSlug) {
      return cors.error(request, { error: "roomSlug is required" }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !serverUrl) {
      return cors.error(request, { error: "LiveKit is not configured" }, { status: 503 });
    }

    const db = getDb();
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.slug, roomSlug),
    });

    if (!room) {
      return cors.error(request, { error: "Room not found" }, { status: 404 });
    }

    const userMembership = await db.query.roomMembers.findFirst({
      where: and(eq(roomMembers.roomId, room.id), eq(roomMembers.userId, user.id)),
    });

    if (!userMembership) {
      return cors.error(request, { error: "Join the room lobby first" }, { status: 403 });
    }

    const roomName = livekitRoomName(roomSlug);
    const token = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: user.displayName,
      metadata: JSON.stringify({ role: userMembership.role }),
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return cors.json(request, {
      token: jwt,
      serverUrl,
      roomName,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return cors.error(request, { error: "Sign in or continue as guest first" }, { status: 401 });
    }
    console.error(error);
    return cors.error(request, { error: "Failed to create video token" }, { status: 500 });
  }
}

export function OPTIONS(request: Request) {
  return cors.handleOptions(request);
}
