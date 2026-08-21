import { requireCurrentUser } from "@/lib/auth";
import { createRoomForUser, RoomServiceError } from "@/lib/rooms-service";
import * as cors from "@/lib/cors";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as { name?: string };
    const room = await createRoomForUser(user, body.name ?? "");
    return cors.json(request, room, { status: 201 });
  } catch (error) {
    if (error instanceof RoomServiceError) {
      return cors.error(request, { error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return cors.error(request, { error: "Sign in or continue as guest first" }, { status: 401 });
    }
    console.error(error);
    return cors.error(request, { error: "Failed to create room" }, { status: 500 });
  }
}

export function OPTIONS(request: Request) {
  return cors.handleOptions(request);
}
