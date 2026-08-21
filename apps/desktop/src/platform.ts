"use client";

import type { Platform } from "@corgi-chat/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { openUrl } from "@tauri-apps/plugin-opener";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export function createTauriPlatform(): Platform {
  return {
    getWebBaseUrl: () =>
      import.meta.env.VITE_WEB_BASE_URL ?? "https://corgi.chat",

    openExternal: async (url) => {
      await openUrl(url);
    },

    showNotification: async (title, body) => {
      try {
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
          const permission = await requestPermission();
          permissionGranted = permission === "granted";
        }
        if (permissionGranted) {
          await sendNotification({ title, body });
        }
      } catch {
        // Notifications may not be available on all platforms.
      }
    },

    onDeepLink: (callback) => {
      const unlisten = onOpenUrl((urls) => {
        const url = urls[0];
        if (url) {
          callback(url);
        }
      });
      return async () => {
        const off = await unlisten;
        off?.();
      };
    },

    setBadgeCount: (count) => {
      // Tauri does not have a cross-platform badge API in core.
      // Could be implemented with `setProgressBar` or OS-specific plugins.
      void count;
    },

    isAppFocused: async () => {
      try {
        const window = getCurrentWindow();
        return await window.isFocused();
      } catch {
        return document.visibilityState !== "hidden";
      }
    },

    supportsInlineIframes: false,

    openIframeActivity: async (url) => {
      try {
        const window = await WebviewWindow.getByLabel("external-activity");
        if (window) {
          await window.close();
        }
      } catch {
        // ignore
      }

      const external = new WebviewWindow("external-activity", {
        url,
        title: "Corgi Chat Activity",
        width: 1280,
        height: 800,
        center: true,
      });

      void external;
    },

    getSupabaseConfig: () => {
      const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      return url && anonKey ? { url, anonKey } : null;
    },
  };
}
