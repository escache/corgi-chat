import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isClerkEnabled } from "@/lib/clerk-config";

const isPublicRoute = createRouteMatcher([
  "/",
  "/r/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/rooms(.*)",
  "/api/guest",
  "/api/me",
  "/api/webhooks/clerk",
]);

const clerkAuthMiddleware = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export default isClerkEnabled()
  ? clerkAuthMiddleware
  : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
