import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { joinRoomBySlug, RoomServiceError } from "@/lib/rooms-service";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser();
    const { slug } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { displayName?: string };

    if (!user.clerkId && body.displayName && body.displayName !== user.displayName) {
      // Guests may pass a display name on first join; ignore for now since guest is created upfront.
    }

    const result = await joinRoomBySlug(slug, user, user.clerkId ? "member" : "guest");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RoomServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Sign in or continue as guest first" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
