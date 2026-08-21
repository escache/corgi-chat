import { createGuestUser, RoomServiceError } from "@/lib/rooms-service";
import { GUEST_COOKIE_MAX_AGE, GUEST_COOKIE_NAME } from "@/lib/guest";
import * as cors from "@/lib/cors";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { displayName?: string };
    const { user, guestToken } = await createGuestUser(body.displayName ?? "");

    const response = cors.json(request, { guestToken, userId: user.id });
    response.cookies.set(GUEST_COOKIE_NAME, guestToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: GUEST_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof RoomServiceError) {
      return cors.error(request, { error: error.message }, { status: error.status });
    }
    console.error(error);
    return cors.error(request, { error: "Failed to create guest session" }, { status: 500 });
  }
}

export function OPTIONS(request: Request) {
  return cors.handleOptions(request);
}
