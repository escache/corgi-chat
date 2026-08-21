"use client";

import { PlatformProvider, setApiBaseUrl } from "@corgi-chat/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { createWebPlatform } from "../platform";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2000,
          },
        },
      }),
  );

  const [platform] = useState(() =>
    createWebPlatform(typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiBaseUrl(window.location.origin);
    }
  }, []);

  return (
    <PlatformProvider platform={platform}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PlatformProvider>
  );
}
