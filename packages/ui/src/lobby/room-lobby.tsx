"use client";

import type { RoomDetails } from "@corgi-chat/core";
import { usePlatform } from "@corgi-chat/core";
import { useState } from "react";

import { Button } from "../components/button";
import { Card } from "../components/card";
import { ChatPanel } from "../chat/chat-panel";

export interface RoomLobbyProps {
  room: RoomDetails;
  currentUserId?: string;
  onJoinLobby: () => Promise<void>;
  onStartVideo?: () => void;
  onHome?: () => void;
  onLeaveRoom?: () => void;
  onCopyInvite?: () => void;
  isJoining?: boolean;
  error?: string | null;
  livekitConfigured?: boolean;
  giphyApiKey?: string;
}

export function RoomLobby({
  room,
  currentUserId,
  onJoinLobby,
  onStartVideo,
  onHome,
  onLeaveRoom,
  onCopyInvite,
  isJoining = false,
  error,
  livekitConfigured = true,
  giphyApiKey,
}: RoomLobbyProps) {
  const [copied, setCopied] = useState(false);
  const isMember = room.members.some((member) => member.id === currentUserId);
  const platform = usePlatform();

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(`${platform.getWebBaseUrl()}/r/${room.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
    onCopyInvite?.();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            {onHome ? (
              <Button variant="ghost" size="sm" onClick={onHome}>
                ← Home
              </Button>
            ) : null}
            <div>
              <p className="text-sm text-violet-300">Room</p>
              <h1 className="text-3xl font-bold">{room.name}</h1>
              <p className="mt-1 text-slate-400">/{room.slug}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isMember ? (
              <>
                <Button variant="secondary" size="sm" onClick={handleCopyInvite}>
                  {copied ? "Copied!" : "Copy invite link"}
                </Button>
                {onLeaveRoom ? (
                  <Button variant="ghost" size="sm" onClick={onLeaveRoom}>
                    Leave room
                  </Button>
                ) : null}
              </>
            ) : null}
            {isMember && livekitConfigured && onStartVideo ? (
              <Button variant="secondary" onClick={onStartVideo}>
                Start video call
              </Button>
            ) : null}
          </div>
        </header>

        {!isMember ? (
          <Card className="max-w-lg">
            <h2 className="text-lg font-semibold">Join room</h2>
            <p className="mt-2 text-slate-400">Enter the lobby to chat and optionally start video.</p>
            <div className="mt-6 space-y-3">
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <Button onClick={() => void onJoinLobby()} disabled={isJoining}>
                {isJoining ? "Joining..." : "Join room"}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid flex-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <ChatPanel
              roomSlug={room.slug}
              enabled
              giphyApiKey={giphyApiKey}
              currentUserId={currentUserId}
              roomName={room.name}
            />

            <Card>
              <h2 className="text-lg font-semibold">In room ({room.members.length})</h2>
              <ul className="mt-4 space-y-3">
                {room.members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between rounded-lg bg-slate-900/70 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{member.displayName}</p>
                      <p className="text-xs capitalize text-slate-400">{member.role}</p>
                    </div>
                    {member.id === currentUserId ? (
                      <span className="text-xs text-violet-300">You</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {!livekitConfigured ? (
                <p className="mt-4 text-xs text-amber-400/90">
                  Video unavailable — set LiveKit env vars to enable calls.
                </p>
              ) : null}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
