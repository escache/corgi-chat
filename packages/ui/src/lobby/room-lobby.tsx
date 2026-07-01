"use client";

import type { RoomDetails } from "@corgi-chat/core";

import { Button } from "../components/button";
import { Card } from "../components/card";

export interface RoomLobbyProps {
  room: RoomDetails;
  currentUserId?: string;
  onJoinLobby: () => Promise<void>;
  isJoining?: boolean;
  error?: string | null;
}

export function RoomLobby({
  room,
  currentUserId,
  onJoinLobby,
  isJoining = false,
  error,
}: RoomLobbyProps) {
  const isMember = room.members.some((member) => member.id === currentUserId);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
        <header className="mb-8">
          <p className="text-sm text-violet-300">Room</p>
          <h1 className="text-3xl font-bold">{room.name}</h1>
          <p className="mt-2 text-slate-400">/{room.slug}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <h2 className="text-lg font-semibold">Lobby</h2>
            <p className="mt-2 text-slate-400">
              Video is coming in Phase 2. For now, gather everyone here before the call starts.
            </p>

            {!isMember ? (
              <div className="mt-6 space-y-3">
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <Button onClick={() => void onJoinLobby()} disabled={isJoining}>
                  {isJoining ? "Joining..." : "Join lobby"}
                </Button>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400">
                Waiting for video... Phase 2 will connect LiveKit here.
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Participants ({room.members.length})</h2>
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
          </Card>
        </div>
      </div>
    </div>
  );
}
