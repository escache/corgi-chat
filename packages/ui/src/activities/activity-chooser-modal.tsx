"use client";

import { ACTIVITY_GROUPS, ACTIVITY_REGISTRY, type ActivityId } from "@corgi-chat/core";

import { Button } from "../components/button";
import { cn } from "../lib/cn";

export interface ActivityChooserModalProps {
  open: boolean;
  activeActivityId: ActivityId | null;
  onClose: () => void;
  onSelect: (id: ActivityId) => void;
}

export function ActivityChooserModal({
  open,
  activeActivityId,
  onClose,
  onSelect,
}: ActivityChooserModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose an activity"
        className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">Choose an Activity</h2>
          <button
            type="button"
            className="text-slate-400 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-4">
          {ACTIVITY_GROUPS.map((group) => (
            <section key={group.id}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {group.label}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.activities.map((activityId) => {
                  const meta = ACTIVITY_REGISTRY[activityId];
                  const active = activeActivityId === activityId;
                  return (
                    <button
                      key={activityId}
                      type="button"
                      className={cn(
                        "rounded-lg border px-3 py-3 text-left transition-colors",
                        active
                          ? "border-violet-500 bg-violet-600/20"
                          : "border-slate-700 bg-slate-950/60 hover:border-slate-500",
                      )}
                      onClick={() => onSelect(activityId)}
                    >
                      <p className="font-medium text-white">{meta.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{meta.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-800 px-4 py-3">
          {activeActivityId ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onSelect(activeActivityId);
                onClose();
              }}
            >
              Close activity
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
