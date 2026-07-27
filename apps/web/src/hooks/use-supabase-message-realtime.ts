"use client";

import { messagesQueryKey } from "@corgi-chat/core";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/** Subscribe to Supabase Realtime when env vars are configured. */
export function useSupabaseMessageRealtime(
  roomSlug: string,
  options: { enabled?: boolean; roomId?: string } = {},
) {
  const { enabled = true, roomId } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !roomSlug) {
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return;
    }

    let cancelled = false;
    let channel: { unsubscribe: () => void } | null = null;

    void import("@supabase/supabase-js")
      .then(({ createClient }) => {
        if (cancelled) {
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
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
  }, [enabled, queryClient, roomId, roomSlug]);
}
