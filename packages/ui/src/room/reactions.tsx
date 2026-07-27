"use client";

import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "👋"] as const;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

interface ReactionEvent {
  kind: "reaction";
  userId: string;
  emoji: string;
}

export function useVideoReactions(userId: string) {
  const room = useRoomContext();
  const [reactions, setReactions] = useState<Record<string, string>>({});

  const showReaction = useCallback((id: string, emoji: string) => {
    setReactions((current) => ({ ...current, [id]: emoji }));
    window.setTimeout(() => {
      setReactions((current) => {
        const next = { ...current };
        if (next[id] === emoji) {
          delete next[id];
        }
        return next;
      });
    }, 4000);
  }, []);

  useEffect(() => {
    const onData = (payload: Uint8Array) => {
      try {
        const message = JSON.parse(decoder.decode(payload)) as ReactionEvent;
        if (message.kind !== "reaction" || !message.userId || !message.emoji) {
          return;
        }
        showReaction(message.userId, message.emoji);
      } catch {
        // ignore
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, showReaction]);

  const sendReaction = useCallback(
    (emoji: string) => {
      const message: ReactionEvent = { kind: "reaction", userId, emoji };
      void room.localParticipant.publishData(encoder.encode(JSON.stringify(message)), {
        reliable: true,
      });
      showReaction(userId, emoji);
    },
    [room, showReaction, userId],
  );

  return { reactions, sendReaction, emojis: REACTION_EMOJIS };
}

export function ReactionOverlay({ reactions }: { reactions: Record<string, string> }) {
  const entries = Object.entries(reactions);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center gap-3">
      {entries.map(([id, emoji]) => (
        <span
          key={id}
          className="animate-bounce rounded-full bg-slate-950/70 px-3 py-2 text-3xl shadow-lg"
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
