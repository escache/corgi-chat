"use client";

import { useJoinRoom, useLiveKitToken, useRoom } from "@corgi-chat/core";
import { CallPreview, ChatPanel, RoomLobby, VideoRoom } from "@corgi-chat/ui";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useSupabaseMessageRealtime } from "@/hooks/use-supabase-message-realtime";

import "@livekit/components-styles";

type RoomView = "lobby" | "preview" | "call";

export default function RoomPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const roomQuery = useRoom(slug);
  const joinRoom = useJoinRoom(slug);
  const [view, setView] = useState<RoomView>("lobby");
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [displayName, setDisplayName] = useState("Guest");
  const [error, setError] = useState<string | null>(null);
  const [livekitConfigured, setLivekitConfigured] = useState(true);
  const [showCallChat, setShowCallChat] = useState(true);

  const tokenQuery = useLiveKitToken(slug, view === "call");
  const chatEnabled =
    Boolean(currentUserId) && (view === "lobby" || view === "call");

  useSupabaseMessageRealtime(slug, {
    enabled: chatEnabled,
    roomId: roomQuery.data?.id,
  });

  useEffect(() => {
    void fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { userId?: string; displayName?: string } | null) => {
        if (body?.userId) {
          setCurrentUserId(body.userId);
        }
        if (body?.displayName) {
          setDisplayName(body.displayName);
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

  if (view === "preview") {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-2xl font-bold">Join video — {roomQuery.data.name}</h1>
          <CallPreview
            displayName={displayName}
            error={error}
            isJoining={tokenQuery.isFetching}
            onCancel={() => {
              setError(null);
              setView("lobby");
            }}
            onJoin={() => {
              setError(null);
              setLivekitConfigured(true);
              setView("call");
            }}
          />
        </div>
      </div>
    );
  }

  if (view === "call") {
    if (tokenQuery.isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
          Connecting video...
        </div>
      );
    }

    if (tokenQuery.isError || !tokenQuery.data) {
      const message =
        tokenQuery.error instanceof Error ? tokenQuery.error.message : "Video unavailable";

      return (
        <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
          <div className="mx-auto max-w-lg space-y-4">
            <p className="text-red-400">{message}</p>
            <button
              type="button"
              className="text-violet-300 underline"
              onClick={() => {
                if (message.toLowerCase().includes("not configured")) {
                  setLivekitConfigured(false);
                }
                setView("lobby");
              }}
            >
              Back to room
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 px-4 py-6 text-white lg:px-6">
        <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-7xl flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">{roomQuery.data.name}</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                onClick={() => setShowCallChat((value) => !value)}
              >
                {showCallChat ? "Hide chat" : "Show chat"}
              </button>
              <button
                type="button"
                className="text-sm text-slate-400 hover:text-white"
                onClick={() => setView("lobby")}
              >
                ← Back to lobby
              </button>
            </div>
          </div>
          <div
            className={`grid min-h-0 flex-1 gap-4 ${showCallChat ? "lg:grid-cols-[minmax(0,1fr)_340px]" : ""}`}
          >
            <VideoRoom
              token={tokenQuery.data.token}
              serverUrl={tokenQuery.data.serverUrl}
              onLeave={() => setView("lobby")}
            />
            {showCallChat ? (
              <ChatPanel
                roomSlug={slug}
                enabled
                compact
                giphyApiKey={process.env.NEXT_PUBLIC_GIPHY_API_KEY}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoomLobby
      room={roomQuery.data}
      currentUserId={currentUserId}
      livekitConfigured={livekitConfigured}
      isJoining={joinRoom.isPending}
      error={error}
      giphyApiKey={process.env.NEXT_PUBLIC_GIPHY_API_KEY}
      onStartVideo={() => setView("preview")}
      onJoinLobby={async () => {
        setError(null);
        try {
          const result = await joinRoom.mutateAsync();
          setCurrentUserId(result.member.id);
          setDisplayName(result.member.displayName);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Could not join room");
        }
      }}
    />
  );
}
