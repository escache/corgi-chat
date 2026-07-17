export type ActivityId =
  | "youtube"
  | "twitch"
  | "draw"
  | "excalidraw"
  | "shared-iframe";

export type ActivityGroup = "video" | "tools";

export interface ActivityMeta {
  id: ActivityId;
  label: string;
  group: ActivityGroup;
  requiresSync: boolean;
  description: string;
}

export interface ActivityProps {
  userId: string;
  isHost: boolean;
  onClose: () => void;
}

/** Envelope for every LiveKit data-channel activity message (<15KB). */
export interface ActivityDataMessage<T = unknown> {
  activityId: ActivityId;
  userId: string;
  type: string;
  payload: T;
}

export interface DrawStrokePayload {
  type: "stroke";
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
}

export interface YoutubeSyncPayload {
  type: "yt-sync";
  action: "play" | "pause" | "seek" | "load";
  timestamp: number;
  videoId: string;
}
