"use client";

import { useJoinRoom, useRoom } from "@corgi-chat/core";
import { RoomLobby } from "@corgi-chat/ui";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const roomQuery = useRoom(slug);
  const joinRoom = useJoinRoom(slug);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { userId?: string } | null) => {
        if (body?.userId) {
          setCurrentUserId(body.userId);
        }
      })
      .catch(() => undefined);
  }, []);

  if (roomQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading room...
      </div>
    );
  }

  if (roomQuery.isError || !roomQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-red-400">
        {roomQuery.error instanceof Error ? roomQuery.error.message : "Room not found"}
      </div>
    );
  }

  return (
    <RoomLobby
      room={roomQuery.data}
      currentUserId={currentUserId}
      isJoining={joinRoom.isPending}
      error={error}
      onJoinLobby={async () => {
        setError(null);
        try {
          const result = await joinRoom.mutateAsync();
          setCurrentUserId(result.member.id);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Could not join room");
        }
      }}
    />
  );
}
