"use client";

import type { ActivityDataMessage, ActivityId } from "@corgi-chat/core";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { useCallback, useEffect } from "react";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function useActivityDataChannel(
  activityId: ActivityId,
  userId: string,
  onMessage: (message: ActivityDataMessage) => void,
) {
  const room = useRoomContext();

  useEffect(() => {
    const handleData = (payload: Uint8Array, participant?: { identity?: string }) => {
      try {
        const parsed = JSON.parse(decoder.decode(payload)) as ActivityDataMessage;
        if (parsed.activityId !== activityId) {
          return;
        }
        if (parsed.userId === userId || participant?.identity === userId) {
          // Ignore own echoes when identity matches; still allow if sender differs
        }
        if (parsed.userId === userId) {
          return;
        }
        onMessage(parsed);
      } catch {
        // ignore malformed packets
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [activityId, onMessage, room, userId]);

  const publish = useCallback(
    (type: string, payload: unknown) => {
      const message: ActivityDataMessage = {
        activityId,
        userId,
        type,
        payload,
      };
      const data = encoder.encode(JSON.stringify(message));
      if (data.byteLength > 14_000) {
        console.warn("Activity data packet too large; skipping publish");
        return;
      }
      void room.localParticipant.publishData(data, { reliable: true });
    },
    [activityId, room, userId],
  );

  return { publish };
}
