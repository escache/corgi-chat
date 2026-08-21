import { requireCurrentUser } from "@/lib/auth";
import { createRoomMessage, listRoomMessages } from "@/lib/messages-service";
import { RoomServiceError } from "@/lib/rooms-service";
import * as cors from "@/lib/cors";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser();
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const before = searchParams.get("before") ?? undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

    const result = await listRoomMessages(slug, user, { before, limit });
    return cors.json(request, result);
  } catch (error) {
    if (error instanceof RoomServiceError) {
      return cors.error(request, { error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return cors.error(request, { error: "Sign in or continue as guest first" }, { status: 401 });
    }
    console.error(error);
    return cors.error(request, { error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser();
    const { slug } = await context.params;
    const body = (await request.json()) as {
      body?: string;
      type?: "text" | "gif";
      metadata?: Record<string, unknown>;
    };

    const message = await createRoomMessage(slug, user, {
      body: body.body ?? "",
      type: body.type,
      metadata: body.metadata,
    });

    return cors.json(request, message, { status: 201 });
  } catch (error) {
    if (error instanceof RoomServiceError) {
      return cors.error(request, { error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return cors.error(request, { error: "Sign in or continue as guest first" }, { status: 401 });
    }
    console.error(error);
    return cors.error(request, { error: "Failed to send message" }, { status: 500 });
  }
}

export function OPTIONS(request: Request) {
  return cors.handleOptions(request);
}
