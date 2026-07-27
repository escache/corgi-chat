"use client";

import { useEffect } from "react";

export const KEY_LABELS = {
  mute: "Mute (M)",
  camera: "Camera (C)",
  leave: "Leave (L)",
} as const;

export interface CallHotkeysProps {
  enabled?: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onLeave: () => void;
}

/** Keyboard shortcuts for in-call controls. Ignores keypresses while typing in inputs. */
export function useCallHotkeys({
  enabled = true,
  onToggleMute,
  onToggleCamera,
  onLeave,
}: CallHotkeysProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "m") {
        event.preventDefault();
        onToggleMute();
      } else if (key === "c" || key === "v") {
        event.preventDefault();
        onToggleCamera();
      } else if (key === "l") {
        event.preventDefault();
        onLeave();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onLeave, onToggleCamera, onToggleMute]);
}
