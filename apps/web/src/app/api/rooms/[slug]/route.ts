import { getRoomBySlug, RoomServiceError } from "@/lib/rooms-service";
import * as cors from "@/lib/cors";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const room = await getRoomBySlug(slug);
    return cors.json(request, room);
  } catch (error) {
    if (error instanceof RoomServiceError) {
      return cors.error(request, { error: error.message }, { status: error.status });
    }
    console.error(error);
    return cors.error(request, { error: "Failed to load room" }, { status: 500 });
  }
}

export function OPTIONS(request: Request) {
  return cors.handleOptions(request);
}
