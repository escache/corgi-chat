import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { getDb, users, type User } from "@corgi-chat/db";

import { isClerkEnabled } from "./clerk-config";
import { GUEST_COOKIE_NAME } from "./guest";

export async function getCurrentUser(): Promise<User | null> {
  const db = getDb();

  if (isClerkEnabled()) {
    const clerkAuth = await auth();
    const clerkUser = clerkAuth.userId ? await currentUser() : null;

    if (clerkUser) {
    const existing = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUser.id),
    });

    if (existing) {
      return existing;
    }

    const displayName =
      clerkUser.fullName ??
      clerkUser.username ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "User";

    const [created] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        displayName,
        avatarUrl: clerkUser.imageUrl,
      })
      .returning();

      return created;
    }
  }

  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!guestToken) {
    return null;
  }

  const guestUser = await db.query.users.findFirst({
    where: eq(users.guestToken, guestToken),
  });

  return guestUser ?? null;
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
