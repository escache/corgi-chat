"use client";

import { useState } from "react";

import { Button } from "../components/button";
import { Card } from "../components/card";
import { Input } from "../components/input";

export interface HomeLobbyProps {
  isSignedIn: boolean;
  userName?: string | null;
  onSignIn: () => void;
  onContinueAsGuest: (displayName: string) => Promise<void>;
  onCreateRoom: (name: string) => Promise<void>;
  isCreating?: boolean;
  error?: string | null;
}

export function HomeLobby({
  isSignedIn,
  userName,
  onSignIn,
  onContinueAsGuest,
  onCreateRoom,
  isCreating = false,
  error,
}: HomeLobbyProps) {
  const [roomName, setRoomName] = useState("");
  const [guestName, setGuestName] = useState("");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.25),_transparent_55%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
          <header className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-tight">corgi chat</div>
            {!isSignedIn ? (
              <Button variant="secondary" onClick={onSignIn}>
                Sign in
              </Button>
            ) : (
              <div className="text-sm text-slate-300">Signed in as {userName}</div>
            )}
          </header>

          <main className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Free and secure video hangouts for everyone.
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Create a room, invite friends, and hang out. Video calls arrive in the next
                phase — today we&apos;re building the lobby.
              </p>
            </div>

            <Card className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Get Started</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Create a room and share the link with your group.
                </p>
              </div>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onCreateRoom(roomName);
                }}
              >
                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Room name</span>
                  <Input
                    autoFocus
                    required
                    placeholder="eg. Game Night"
                    value={roomName}
                    onChange={(event) => setRoomName(event.target.value)}
                  />
                </label>
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!roomName.trim() || isCreating || (!isSignedIn && !guestName.trim())}
                >
                  {isCreating ? "Creating..." : "Create Room"}
                </Button>
              </form>

              {!isSignedIn ? (
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <p className="text-sm text-slate-400">Or continue as a guest</p>
                  <Input
                    placeholder="Your display name"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                  />
                  <Button
                    variant="ghost"
                    className="w-full"
                    disabled={!guestName.trim()}
                    onClick={() => void onContinueAsGuest(guestName.trim())}
                  >
                    Continue as guest
                  </Button>
                </div>
              ) : null}
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
