"use client";

import { ParticipantLoop, ParticipantTile, useParticipants } from "@livekit/components-react";

import { cn } from "../lib/cn";

function getGridClass(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count <= 4) return "grid-cols-2";
  if (count <= 6) return "grid-cols-3";
  return "grid-cols-4";
}

export function VideoGrid() {
  const participants = useParticipants();
  const count = Math.max(participants.length, 1);

  return (
    <div className={cn("grid h-full gap-2 p-2", getGridClass(count))}>
      <ParticipantLoop participants={participants}>
        <ParticipantTile className="min-h-[140px] overflow-hidden rounded-xl bg-slate-900" />
      </ParticipantLoop>
    </div>
  );
}

export function PinnedLayout() {
  const participants = useParticipants();
  const pinned = participants[0];
  const others = participants.slice(1);

  if (!pinned) {
    return <VideoGrid />;
  }

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <ParticipantLoop participants={[pinned]}>
        <ParticipantTile className="min-h-[240px] flex-1 overflow-hidden rounded-xl bg-slate-900" />
      </ParticipantLoop>
      {others.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          <ParticipantLoop participants={others}>
            <ParticipantTile className="aspect-video overflow-hidden rounded-lg bg-slate-900" />
          </ParticipantLoop>
        </div>
      ) : null}
    </div>
  );
}
