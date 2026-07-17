"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "../components/button";
import { PermissionsAlert } from "./permissions-alert";

export interface CallPreviewProps {
  displayName: string;
  onJoin: () => void;
  onCancel: () => void;
  isJoining?: boolean;
  error?: string | null;
}

export function CallPreview({
  displayName,
  onJoin,
  onCancel,
  isJoining = false,
  error,
}: CallPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let active = true;
    let mediaStream: MediaStream | null = null;

    void navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((result) => {
        if (!active) {
          result.getTracks().forEach((track) => track.stop());
          return;
        }
        mediaStream = result;
        setStream(result);
        setPermissionBlocked(false);
        if (videoRef.current) {
          videoRef.current.srcObject = result;
        }
      })
      .catch(() => {
        setPermissionBlocked(true);
        setStream(null);
      });

    return () => {
      active = false;
      mediaStream?.getTracks().forEach((track) => track.stop());
    };
  }, [retryToken]);

  return (
    <div className="flex min-h-[420px] flex-col gap-4">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover mirror -scale-x-100"
        />
        {!stream ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            {permissionBlocked ? "Permissions needed" : "Starting camera..."}
          </div>
        ) : null}
      </div>

      <p className="text-sm text-slate-400">
        Joining as <span className="text-white">{displayName}</span>. Video is optional — text chat
        remains the main room experience.
      </p>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex gap-3">
        <Button onClick={onJoin} disabled={isJoining}>
          {isJoining ? "Connecting..." : "Join video"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Back to room
        </Button>
      </div>

      <PermissionsAlert
        open={permissionBlocked}
        onClose={() => setPermissionBlocked(false)}
        onRetry={() => {
          setPermissionBlocked(false);
          setRetryToken((value) => value + 1);
        }}
      />
    </div>
  );
}
