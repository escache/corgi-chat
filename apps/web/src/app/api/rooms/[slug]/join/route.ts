import { requireCurrentUser } from "@/lib/auth";
import { joinRoomBySlug, RoomServiceError } from "@/lib/rooms-service";
import * as cors from "@/lib/cors";

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
    return cors.json(request, result);
  } catch (error) {
    if (error instanceof RoomServiceError) {
      return cors.error(request, { error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return cors.error(request, { error: "Sign in or continue as guest first" }, { status: 401 });
    }
    console.error(error);
    return cors.error(request, { error: "Failed to join room" }, { status: 500 });
  }
}

export function OPTIONS(request: Request) {
  return cors.handleOptions(request);
}
