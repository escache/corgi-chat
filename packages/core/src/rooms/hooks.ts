"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createRoom, fetchRoom, joinRoom } from "./api";
import type { CreateRoomInput } from "./types";

export function roomQueryKey(slug: string) {
  return ["room", slug] as const;
}

export function useRoom(slug: string, enabled = true) {
  return useQuery({
    queryKey: roomQueryKey(slug),
    queryFn: () => fetchRoom(slug),
    enabled: enabled && Boolean(slug),
    refetchInterval: 3000,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoomInput) => createRoom(input),
    onSuccess: (room) => {
      queryClient.setQueryData(roomQueryKey(room.slug), room);
    },
  });
}

export function useJoinRoom(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => joinRoom(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomQueryKey(slug) });
    },
  });
}
