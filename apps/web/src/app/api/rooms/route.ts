import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { createRoomForUser, RoomServiceError } from "@/lib/rooms-service";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as { name?: string };
    const room = await createRoomForUser(user, body.name ?? "");
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    if (error instanceof RoomServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Sign in or continue as guest first" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
