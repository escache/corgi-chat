"use client";

import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";

import { Button } from "../components/button";

export interface VideoControlsProps {
  onLeave: () => void;
}

export function VideoControls({ onLeave }: VideoControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const isMuted = !localParticipant.isMicrophoneEnabled;
  const isCameraOff = !localParticipant.isCameraEnabled;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-800 bg-slate-950/90 p-3">
      <Button
        variant={isMuted ? "secondary" : "ghost"}
        size="sm"
        onClick={() => void localParticipant.setMicrophoneEnabled(isMuted)}
      >
        {isMuted ? "Unmute" : "Mute"}
      </Button>
      <Button
        variant={isCameraOff ? "secondary" : "ghost"}
        size="sm"
        onClick={() => void localParticipant.setCameraEnabled(isCameraOff)}
      >
        {isCameraOff ? "Camera on" : "Camera off"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void localParticipant.setScreenShareEnabled(true)}
      >
        Share screen
      </Button>
      <Button variant="secondary" size="sm" onClick={onLeave}>
        Leave video
      </Button>
    </div>
  );
}

export function useStopScreenShareOnLeave() {
  const { localParticipant } = useLocalParticipant();

  return async () => {
    if (localParticipant.isScreenShareEnabled) {
      await localParticipant.setScreenShareEnabled(false);
    }
    for (const publication of localParticipant.trackPublications.values()) {
      if (publication.source === Track.Source.Camera) {
        await localParticipant.setCameraEnabled(false);
      }
      if (publication.source === Track.Source.Microphone) {
        await localParticipant.setMicrophoneEnabled(false);
      }
    }
  };
}
