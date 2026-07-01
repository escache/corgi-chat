import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { upsertClerkUser } from "@/lib/rooms-service";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    image_url?: string | null;
    email_addresses?: Array<{ email_address: string }>;
  };
};

export async function POST(request: Request) {
  const payload = await request.text();
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  let event: ClerkWebhookEvent;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const displayName =
      [event.data.first_name, event.data.last_name].filter(Boolean).join(" ").trim() ||
      event.data.username ||
      event.data.email_addresses?.[0]?.email_address ||
      "User";

    await upsertClerkUser({
      clerkId: event.data.id,
      displayName,
      avatarUrl: event.data.image_url,
    });
  }

  return NextResponse.json({ received: true });
}
