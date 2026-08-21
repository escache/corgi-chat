"use client";

import type { Platform } from "@corgi-chat/core";

export function createWebPlatform(baseUrl: string): Platform {
  return {
    getWebBaseUrl: () => baseUrl,

    openExternal: async (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },

    showNotification: async (title, body) => {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification(title, { body });
        }
      }
    },

    onDeepLink: () => () => undefined,

    getSupabaseConfig: () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      return url && anonKey ? { url, anonKey } : null;
    },

    setBadgeCount: () => undefined,

    isAppFocused: async () =>
      typeof document !== "undefined" ? document.visibilityState !== "hidden" : true,

    supportsInlineIframes: true,

    openIframeActivity: async (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
  };
}
