"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { usePlatform } from "../platform";

import { messagesQueryKey } from "./hooks";

/** Subscribe to Supabase Realtime when the platform provides config. */
export function useSupabaseMessageRealtime(
  roomSlug: string,
  options: { enabled?: boolean; roomId?: string } = {},
) {
  const { enabled = true, roomId } = options;
  const queryClient = useQueryClient();
  const platform = usePlatform();

  useEffect(() => {
    if (!enabled || !roomSlug) {
      return;
    }

    const config = platform.getSupabaseConfig?.();
    if (!config) {
      return;
    }

    let cancelled = false;
    let channel: { unsubscribe: () => void } | null = null;

    void import("@supabase/supabase-js")
      .then(({ createClient }) => {
        if (cancelled) {
          return;
        }

        const supabase = createClient(config.url, config.anonKey);
        const filter = roomId ? `room_id=eq.${roomId}` : undefined;

        channel = supabase
          .channel(`room-messages:${roomSlug}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              ...(filter ? { filter } : {}),
            },
            () => {
              void queryClient.invalidateQueries({ queryKey: messagesQueryKey(roomSlug) });
            },
          )
          .subscribe();
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      channel?.unsubscribe();
    };
  }, [enabled, queryClient, roomId, roomSlug, platform]);
}
