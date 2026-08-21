"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { usePlatform } from "../platform";

import { fetchMessages, sendMessage } from "./api";
import type { ChatMessage, SendMessageInput } from "./types";

export function messagesQueryKey(slug: string) {
  return ["messages", slug] as const;
}

export function useMessages(slug: string, enabled = true) {
  return useQuery({
    queryKey: messagesQueryKey(slug),
    queryFn: () => fetchMessages(slug),
    enabled: enabled && Boolean(slug),
    refetchInterval: 2500,
  });
}

export function useSendMessage(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendMessageInput) => sendMessage(slug, input),
    onSuccess: (message) => {
      queryClient.setQueryData<{
        messages: ChatMessage[];
        hasMore: boolean;
      }>(messagesQueryKey(slug), (current) => {
        if (!current) {
          return { messages: [message], hasMore: false };
        }

        if (current.messages.some((existing) => existing.id === message.id)) {
          return current;
        }

        return {
          ...current,
          messages: [...current.messages, message],
        };
      });
    },
  });
}

/**
 * Notify the user when new chat messages arrive while the app is not focused.
 * Skips messages sent by the current user.
 */
export function useMessageNotifications(
  messages: ChatMessage[],
  currentUserId: string | undefined,
  roomName?: string,
) {
  const platform = usePlatform();
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!platform.showNotification || !messages.length) {
      return;
    }

    for (const message of messages) {
      if (seenIds.current.has(message.id)) {
        continue;
      }
      seenIds.current.add(message.id);

      if (message.userId === currentUserId) {
        continue;
      }

      if (message.type === "system") {
        continue;
      }

      void (async () => {
        try {
          const focused = await (platform.isAppFocused?.() ?? Promise.resolve(true));
          if (focused) {
            return;
          }

          const title = roomName ? `Corgi Chat · ${roomName}` : "Corgi Chat";
          const body = message.author?.displayName
            ? `${message.author.displayName}: ${message.body}`
            : message.body;

          await platform.showNotification(title, body);
        } catch {
          // Notifications are best-effort.
        }
      })();
    }
  }, [messages, currentUserId, roomName, platform]);
}
