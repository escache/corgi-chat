import { getCurrentUser } from "@/lib/auth";
import * as cors from "@/lib/cors";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return cors.error(request, { error: "Unauthorized" }, { status: 401 });
  }

  return cors.json(request, {
    userId: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isGuest: !user.clerkId,
  });
}

export function OPTIONS(request: Request) {
  return cors.handleOptions(request);
}
