"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useCreateRoom } from "@corgi-chat/core";
import { HomeLobby } from "@corgi-chat/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthHeader } from "@/components/auth-header";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const createRoom = useCreateRoom();
  const [guestReady, setGuestReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <HomeLobby
      isSignedIn={Boolean(isSignedIn) || guestReady}
      userName={user?.fullName ?? user?.username}
      authHeader={<AuthHeader />}
      onContinueAsGuest={async (displayName) => {
        setError(null);
        const response = await fetch("/api/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName }),
        });

        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          setError(body.error ?? "Could not start guest session");
          return;
        }

        setGuestReady(true);
      }}
      onCreateRoom={async (name) => {
        setError(null);
        try {
          const room = await createRoom.mutateAsync({ name });
          router.push(`/r/${room.slug}`);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Could not create room");
        }
      }}
      isCreating={createRoom.isPending}
      error={error}
    />
  );
}
