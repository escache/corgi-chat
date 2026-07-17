"use client";

import type { ActivityId } from "@corgi-chat/core";
import { LiveKitRoom, RoomAudioRenderer, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";

import { ActivityChooserModal } from "../activities/activity-chooser-modal";
import { ActivityPane } from "../activities/activity-pane";
import { DraggableSplit } from "../activities/draggable-split";
import { LiveParticipantSidebar } from "./participant-sidebar";
import { useStopScreenShareOnLeave, VideoControls } from "./video-controls";
import { PinnedLayout, VideoGrid } from "./video-layout";

export interface VideoRoomProps {
  token: string;
  serverUrl: string;
  onLeave: () => void;
  joinSoundSrc?: string;
  leaveSoundSrc?: string;
  /** Current app user id (for activity data channel authorship). */
  userId?: string;
  /** Room host controls YouTube / shared URL inputs. */
  isHost?: boolean;
}

function VideoRoomInner({
  onLeave,
  joinSoundSrc = "/sounds/joinBloop.mp3",
  leaveSoundSrc = "/sounds/leaveBloop.mp3",
  userId = "anonymous",
  isHost = false,
}: Omit<VideoRoomProps, "token" | "serverUrl">) {
  const [layout, setLayout] = useState<"grid" | "pinned">("grid");
  const [chooserOpen, setChooserOpen] = useState(false);
  const [activeActivityId, setActiveActivityId] = useState<ActivityId | null>(null);
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
    setActiveActivityId(null);
    void stopMedia().finally(onLeave);
  };

  const videoPane = (
    <div className="h-full min-h-[240px] overflow-hidden rounded-lg bg-black">
      {layout === "grid" ? <VideoGrid /> : <PinnedLayout />}
    </div>
  );

  return (
    <div className="flex h-full min-h-[360px] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <p className="text-sm font-medium text-slate-300">Video call</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            onClick={() => setChooserOpen(true)}
          >
            Activities
          </button>
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

      <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[1fr_220px]">
        <div className="min-h-0 overflow-hidden">
          {activeActivityId ? (
            <DraggableSplit
              left={videoPane}
              right={
                <ActivityPane
                  activityId={activeActivityId}
                  userId={userId}
                  isHost={isHost}
                  onClose={() => setActiveActivityId(null)}
                />
              }
            />
          ) : (
            videoPane
          )}
        </div>
        <LiveParticipantSidebar />
      </div>

      <VideoControls onLeave={handleLeave} />
      <RoomAudioRenderer />

      <ActivityChooserModal
        open={chooserOpen}
        activeActivityId={activeActivityId}
        onClose={() => setChooserOpen(false)}
        onSelect={(id) => {
          setActiveActivityId((current) => (current === id ? null : id));
          setChooserOpen(false);
        }}
      />
    </div>
  );
}

export function VideoRoom({
  token,
  serverUrl,
  onLeave,
  joinSoundSrc,
  leaveSoundSrc,
  userId,
  isHost,
}: VideoRoomProps) {
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
        userId={userId}
        isHost={isHost}
      />
    </LiveKitRoom>
  );
}

/** @deprecated Use ChatPanel from @corgi-chat/ui/chat — kept for temporary compatibility. */
export function ChatPlaceholder() {
  return null;
}
