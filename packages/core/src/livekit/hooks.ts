"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchLiveKitToken } from "./api";

export function livekitTokenQueryKey(slug: string) {
  return ["livekit-token", slug] as const;
}

export function useLiveKitToken(slug: string, enabled = false) {
  return useQuery({
    queryKey: livekitTokenQueryKey(slug),
    queryFn: () => fetchLiveKitToken(slug),
    enabled: enabled && Boolean(slug),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
