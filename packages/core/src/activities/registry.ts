import type { ActivityId, ActivityMeta } from "./types";

export const ACTIVITY_REGISTRY: Record<ActivityId, ActivityMeta> = {
  youtube: {
    id: "youtube",
    label: "YouTube",
    group: "video",
    requiresSync: true,
    description: "Watch together with host-controlled playback",
  },
  twitch: {
    id: "twitch",
    label: "Twitch",
    group: "video",
    requiresSync: false,
    description: "Embed a Twitch channel stream",
  },
  draw: {
    id: "draw",
    label: "Draw",
    group: "tools",
    requiresSync: true,
    description: "Shared whiteboard strokes over the data channel",
  },
  excalidraw: {
    id: "excalidraw",
    label: "Excalidraw",
    group: "tools",
    requiresSync: false,
    description: "Collaborative whiteboard via Excalidraw room",
  },
  "shared-iframe": {
    id: "shared-iframe",
    label: "Web Browser",
    group: "tools",
    requiresSync: false,
    description: "Share any https URL in an iframe",
  },
};

export const ACTIVITY_GROUPS: Array<{
  id: ActivityMeta["group"];
  label: string;
  activities: ActivityId[];
}> = [
  { id: "video", label: "Video", activities: ["youtube", "twitch"] },
  {
    id: "tools",
    label: "Tools",
    activities: ["draw", "excalidraw", "shared-iframe"],
  },
];

export function getActivityMeta(id: ActivityId): ActivityMeta {
  return ACTIVITY_REGISTRY[id];
}

export function listActivities(): ActivityMeta[] {
  return Object.values(ACTIVITY_REGISTRY);
}
