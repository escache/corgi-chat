"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
