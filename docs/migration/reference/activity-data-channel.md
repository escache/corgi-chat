# Activity data-channel message schema

All LiveKit `publishData` payloads for activities use this envelope (JSON, reliable, &lt;15KB):

```ts
{
  activityId: "youtube" | "twitch" | "draw" | "excalidraw" | "shared-iframe";
  userId: string;
  type: string;
  payload: unknown;
}
```

## Draw (`activityId: "draw"`, `type: "stroke"`)

Normalized canvas coordinates (0–1):

```ts
{
  x0: number; y0: number; x1: number; y1: number; color: string;
}
```

## YouTube (`activityId: "youtube"`, `type: "yt-sync"`)

Host-only control broadcasts:

```ts
{
  type: "yt-sync";
  action: "play" | "pause" | "seek" | "load";
  timestamp: number; // seconds
  videoId: string;
}
```

Twitch / Excalidraw / Shared iframe are passive embeds (no data-channel sync in Phase 4).
