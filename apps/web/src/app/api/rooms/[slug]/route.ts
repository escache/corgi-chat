import { NextResponse } from "next/server";

import { getRoomBySlug, RoomServiceError } from "@/lib/rooms-service";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const room = await getRoomBySlug(slug);
    return NextResponse.json(room);
  } catch (error) {
    if (error instanceof RoomServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to load room" }, { status: 500 });
  }
}
