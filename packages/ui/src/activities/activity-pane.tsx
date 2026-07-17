"use client";

import type { ActivityId, ActivityProps } from "@corgi-chat/core";
import { ACTIVITY_REGISTRY } from "@corgi-chat/core";
import type { ComponentType } from "react";

import { DrawActivity } from "./draw-activity";
import {
  ExcalidrawActivity,
  SharedIframeActivity,
  TwitchActivity,
} from "./iframe-activities";
import { YoutubeActivity } from "./youtube-activity";

export interface ActivityPlugin {
  id: ActivityId;
  label: string;
  component: ComponentType<ActivityProps>;
  requiresSync: boolean;
}

export const ACTIVITY_PLUGINS: Record<ActivityId, ActivityPlugin> = {
  youtube: {
    id: "youtube",
    label: ACTIVITY_REGISTRY.youtube.label,
    component: YoutubeActivity,
    requiresSync: true,
  },
  twitch: {
    id: "twitch",
    label: ACTIVITY_REGISTRY.twitch.label,
    component: TwitchActivity,
    requiresSync: false,
  },
  draw: {
    id: "draw",
    label: ACTIVITY_REGISTRY.draw.label,
    component: DrawActivity,
    requiresSync: true,
  },
  excalidraw: {
    id: "excalidraw",
    label: ACTIVITY_REGISTRY.excalidraw.label,
    component: ExcalidrawActivity,
    requiresSync: false,
  },
  "shared-iframe": {
    id: "shared-iframe",
    label: ACTIVITY_REGISTRY["shared-iframe"].label,
    component: SharedIframeActivity,
    requiresSync: false,
  },
};

export function ActivityPane({
  activityId,
  userId,
  isHost,
  onClose,
}: {
  activityId: ActivityId;
  userId: string;
  isHost: boolean;
  onClose: () => void;
}) {
  const plugin = ACTIVITY_PLUGINS[activityId];
  const Component = plugin.component;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <p className="text-sm font-medium text-slate-200">{plugin.label}</p>
        <button
          type="button"
          className="text-xs text-slate-400 hover:text-white"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <Component userId={userId} isHost={isHost} onClose={onClose} />
      </div>
    </div>
  );
}
