"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * Platform adapter for web vs. desktop (Tauri).
 *
 * The interface stays tiny so `packages/ui` and `packages/core` can remain
 * platform-agnostic. Each platform injects its own implementation via the
 * `PlatformProvider`.
 */
export interface Platform {
  /** Base URL for public room links, e.g. https://corgi.chat or http://localhost:3000 */
  getWebBaseUrl(): string;

  /** Open a URL in the user's default browser. */
  openExternal(url: string): Promise<void>;

  /** Show a native/system notification. */
  showNotification(title: string, body: string): Promise<void>;

  /** Subscribe to deep-link / protocol events. */
  onDeepLink(callback: (url: string) => void): () => void;

  /**
   * Return Supabase config when available. Web can read public env vars;
   * desktop can read Vite env or a Tauri config store.
   */
  getSupabaseConfig?(): { url: string; anonKey: string } | null;

  /** Optionally update the app dock/taskbar badge. */
  setBadgeCount?(count: number): void;

  /**
   * Returns true if the app is currently focused. Web can use document visibility;
   * desktop can use the Tauri window focus state.
   */
  isAppFocused?(): Promise<boolean>;

  /**
   * Whether the platform can safely host third-party iframes inline.
   * Tauri's webview has a `tauri://` origin that most embeds (Twitch, etc.)
   * reject, so the desktop app may open these in a separate WebviewWindow
   * or the system browser.
   */
  supportsInlineIframes: boolean;

  /**
   * Open an activity that needs a real web origin in a platform-appropriate
   * container. On web this is a no-op (the iframe already works); on desktop
   * it may open a WebviewWindow or external browser.
   */
  openIframeActivity?(url: string): Promise<void>;
}

const noop = () => undefined;

export const defaultPlatform: Platform = {
  getWebBaseUrl: () =>
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  openExternal: async (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  },
  showNotification: async (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  },
  onDeepLink: () => noop,
  isAppFocused: async () =>
    typeof document !== "undefined" ? document.visibilityState !== "hidden" : true,
  supportsInlineIframes: true,
};

const PlatformContext = createContext<Platform>(defaultPlatform);

export interface PlatformProviderProps {
  platform?: Platform;
  children: ReactNode;
}

export function PlatformProvider({ platform, children }: PlatformProviderProps) {
  const value = useMemo(() => platform ?? defaultPlatform, [platform]);
  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): Platform {
  return useContext(PlatformContext);
}
