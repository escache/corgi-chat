"use client";

import { useParticipants } from "@livekit/components-react";

import { Card } from "../components/card";

export function LiveParticipantSidebar() {
  const participants = useParticipants();

  return (
    <Card className="h-fit p-4">
      <h3 className="text-sm font-semibold text-slate-300">In video ({participants.length})</h3>
      <ul className="mt-3 space-y-2">
        {participants.map((participant) => (
          <li
            key={participant.identity}
            className="flex items-center justify-between rounded-lg bg-slate-900/70 px-3 py-2 text-sm"
          >
            <span>{participant.name || participant.identity}</span>
            <span className="text-xs text-slate-500">
              {participant.isMicrophoneEnabled ? "🎤" : "🔇"}
              {participant.isCameraEnabled ? " 📷" : " 🚫"}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
