"use client";

import { LiveKitRoom, RoomAudioRenderer, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";

import { LiveParticipantSidebar } from "./participant-sidebar";
import { useStopScreenShareOnLeave, VideoControls } from "./video-controls";
import { PinnedLayout, VideoGrid } from "./video-layout";

export interface VideoRoomProps {
  token: string;
  serverUrl: string;
  onLeave: () => void;
  joinSoundSrc?: string;
  leaveSoundSrc?: string;
}

function VideoRoomInner({
  onLeave,
  joinSoundSrc = "/sounds/joinBloop.mp3",
  leaveSoundSrc = "/sounds/leaveBloop.mp3",
}: Omit<VideoRoomProps, "token" | "serverUrl">) {
  const [layout, setLayout] = useState<"grid" | "pinned">("grid");
  const stopMedia = useStopScreenShareOnLeave();
  const joinAudioRef = useRef<HTMLAudioElement | null>(null);
  const leaveAudioRef = useRef<HTMLAudioElement | null>(null);
  const room = useRoomContext();

  useEffect(() => {
    joinAudioRef.current = new Audio(joinSoundSrc);
    leaveAudioRef.current = new Audio(leaveSoundSrc);
    joinAudioRef.current.volume = 0.25;
    leaveAudioRef.current.volume = 0.25;

    const onParticipantConnected = () => {
      void joinAudioRef.current?.play().catch(() => undefined);
    };
    const onParticipantDisconnected = () => {
      void leaveAudioRef.current?.play().catch(() => undefined);
    };

    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    };
  }, [joinSoundSrc, leaveSoundSrc, room]);

  const handleLeave = () => {
    void stopMedia().finally(onLeave);
  };

  return (
    <div className="flex h-full min-h-[360px] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <p className="text-sm font-medium text-slate-300">Video call</p>
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-md px-2 py-1 text-xs ${layout === "grid" ? "bg-violet-600 text-white" : "text-slate-400"}`}
            onClick={() => setLayout("grid")}
          >
            Grid
          </button>
          <button
            type="button"
            className={`rounded-md px-2 py-1 text-xs ${layout === "pinned" ? "bg-violet-600 text-white" : "text-slate-400"}`}
            onClick={() => setLayout("pinned")}
          >
            Pinned
          </button>
        </div>
      </div>

      <div className="grid flex-1 gap-3 p-3 lg:grid-cols-[1fr_220px]">
        <div className="min-h-[240px] overflow-hidden rounded-lg bg-black">
          {layout === "grid" ? <VideoGrid /> : <PinnedLayout />}
        </div>
        <LiveParticipantSidebar />
      </div>

      <VideoControls onLeave={handleLeave} />
      <RoomAudioRenderer />
    </div>
  );
}

export function VideoRoom({ token, serverUrl, onLeave, joinSoundSrc, leaveSoundSrc }: VideoRoomProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      audio
      video
      className="h-full"
      onDisconnected={onLeave}
    >
      <VideoRoomInner
        onLeave={onLeave}
        joinSoundSrc={joinSoundSrc}
        leaveSoundSrc={leaveSoundSrc}
      />
    </LiveKitRoom>
  );
}

/** @deprecated Use ChatPanel from @corgi-chat/ui/chat — kept for temporary compatibility. */
export function ChatPlaceholder() {
  return null;
}
