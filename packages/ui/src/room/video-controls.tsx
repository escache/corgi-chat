"use client";

import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";

import { Button } from "../components/button";
import { KEY_LABELS, useCallHotkeys } from "./call-hotkeys";
import { REACTION_EMOJIS } from "./reactions";

export interface VideoControlsProps {
  onLeave: () => void;
  onOpenSettings?: () => void;
  onSendReaction?: (emoji: string) => void;
  hotkeysEnabled?: boolean;
}

export function VideoControls({
  onLeave,
  onOpenSettings,
  onSendReaction,
  hotkeysEnabled = true,
}: VideoControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const isMuted = !localParticipant.isMicrophoneEnabled;
  const isCameraOff = !localParticipant.isCameraEnabled;

  const toggleMute = () => {
    void localParticipant.setMicrophoneEnabled(isMuted);
  };
  const toggleCamera = () => {
    void localParticipant.setCameraEnabled(isCameraOff);
  };

  useCallHotkeys({
    enabled: hotkeysEnabled,
    onToggleMute: toggleMute,
    onToggleCamera: toggleCamera,
    onLeave,
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-800 bg-slate-950/90 p-3">
      <Button
        variant={isMuted ? "secondary" : "ghost"}
        size="sm"
        title={KEY_LABELS.mute}
        onClick={toggleMute}
      >
        {isMuted ? "Unmute" : "Mute"}
      </Button>
      <Button
        variant={isCameraOff ? "secondary" : "ghost"}
        size="sm"
        title={KEY_LABELS.camera}
        onClick={toggleCamera}
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
      {onOpenSettings ? (
        <Button variant="ghost" size="sm" onClick={onOpenSettings}>
          Settings
        </Button>
      ) : null}
      {onSendReaction ? (
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 px-1">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded-md px-1.5 py-1 text-sm hover:bg-slate-800"
              onClick={() => onSendReaction(emoji)}
              aria-label={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
      <Button variant="secondary" size="sm" title={KEY_LABELS.leave} onClick={onLeave}>
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
