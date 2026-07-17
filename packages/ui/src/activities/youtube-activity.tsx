"use client";

import type { ActivityProps } from "@corgi-chat/core";
import { useCallback, useEffect, useRef, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";

import { Button } from "../components/button";
import { Input } from "../components/input";
import { useActivityDataChannel } from "./use-activity-data-channel";

function parseVideoId(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "") || null;
    }
    return url.searchParams.get("v");
  } catch {
    return value.trim() || null;
  }
}

export function YoutubeActivity({ userId, isHost }: ActivityProps) {
  const [input, setInput] = useState("dQw4w9WgXcQ");
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const playerRef = useRef<YouTubePlayer | null>(null);
  const applyingRemoteRef = useRef(false);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyRemote = useCallback(async (payload: {
    action: string;
    timestamp: number;
    videoId: string;
  }) => {
    if (!playerRef.current) {
      return;
    }

    applyingRemoteRef.current = true;
    try {
      if (payload.videoId && payload.videoId !== videoId) {
        setVideoId(payload.videoId);
        setInput(payload.videoId);
      }

      if (payload.action === "play") {
        await playerRef.current.seekTo(payload.timestamp, true);
        await playerRef.current.playVideo();
      } else if (payload.action === "pause") {
        await playerRef.current.seekTo(payload.timestamp, true);
        await playerRef.current.pauseVideo();
      } else if (payload.action === "seek") {
        const current = await playerRef.current.getCurrentTime();
        if (Math.abs(current - payload.timestamp) > 0.75) {
          await playerRef.current.seekTo(payload.timestamp, true);
        }
      } else if (payload.action === "load") {
        setVideoId(payload.videoId);
        setInput(payload.videoId);
      }
    } finally {
      setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 250);
    }
  }, [videoId]);

  const { publish } = useActivityDataChannel("youtube", userId, (message) => {
    if (message.type !== "yt-sync") {
      return;
    }
    void applyRemote(
      message.payload as { action: string; timestamp: number; videoId: string },
    );
  });

  const broadcast = useCallback(
    async (action: "play" | "pause" | "seek" | "load", nextVideoId = videoId) => {
      if (!isHost || applyingRemoteRef.current) {
        return;
      }
      const timestamp = playerRef.current
        ? await playerRef.current.getCurrentTime()
        : 0;
      publish("yt-sync", {
        type: "yt-sync",
        action,
        timestamp,
        videoId: nextVideoId,
      });
    },
    [isHost, publish, videoId],
  );

  useEffect(() => {
    if (!isHost) {
      return;
    }

    syncIntervalRef.current = setInterval(() => {
      void (async () => {
        if (!playerRef.current || applyingRemoteRef.current) {
          return;
        }
        const state = await playerRef.current.getPlayerState();
        // 1 === playing
        if (state === 1) {
          await broadcast("seek");
        }
      })();
    }, 2000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [broadcast, isHost]);

  const loadVideo = () => {
    const parsed = parseVideoId(input);
    if (!parsed) {
      return;
    }
    setVideoId(parsed);
    if (isHost) {
      void broadcast("load", parsed);
    }
  };

  return (
    <div className="flex h-full min-h-[240px] flex-col bg-slate-950">
      <form
        className="flex gap-2 border-b border-slate-800 p-2"
        onSubmit={(event) => {
          event.preventDefault();
          loadVideo();
        }}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="YouTube URL or video id"
          disabled={!isHost}
        />
        <Button type="submit" size="sm" disabled={!isHost}>
          Load
        </Button>
      </form>
      {!isHost ? (
        <p className="px-3 py-1 text-xs text-amber-300/90">
          Host controls playback. You are viewing in sync.
        </p>
      ) : null}
      <div className="min-h-0 flex-1 bg-black">
        <YouTube
          videoId={videoId}
          className="h-full w-full"
          iframeClassName="h-full w-full"
          opts={{
            width: "100%",
            height: "100%",
            playerVars: { autoplay: 0, rel: 0 },
          }}
          onReady={(event: YouTubeEvent) => {
            playerRef.current = event.target;
          }}
          onPlay={() => {
            void broadcast("play");
          }}
          onPause={() => {
            void broadcast("pause");
          }}
        />
      </div>
    </div>
  );
}
