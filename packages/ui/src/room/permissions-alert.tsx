"use client";

import { Button } from "../components/button";

export interface PermissionsAlertProps {
  open: boolean;
  onClose?: () => void;
  onRetry?: () => void;
}

export function PermissionsAlert({ open, onClose, onRetry }: PermissionsAlertProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="permissions-alert-title"
        className="w-full max-w-md rounded-xl border border-amber-500/40 bg-slate-900 p-5 shadow-xl"
      >
        <h2 id="permissions-alert-title" className="text-lg font-semibold text-white">
          Camera and microphone are blocked
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Corgi needs access to your camera and microphone for video calls. Check site permissions
          in your browser, then refresh. You can still join with microphone only if you do not have
          a webcam.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          {onClose ? (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Dismiss
            </Button>
          ) : null}
          {onRetry ? (
            <Button size="sm" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
