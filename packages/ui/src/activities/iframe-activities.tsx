"use client";

import type { ActivityProps } from "@corgi-chat/core";
import { useMemo, useState } from "react";

import { Button } from "../components/button";
import { Input } from "../components/input";

function addHttps(value: string) {
  if (!value.trim()) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    return value.trim();
  }
  return `https://${value.trim()}`;
}

export function TwitchActivity({ isHost }: ActivityProps) {
  const [channelInput, setChannelInput] = useState("twitch");
  const [channel, setChannel] = useState("twitch");

  const src = useMemo(() => {
    const parent =
      typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${parent}&muted=true`;
  }, [channel]);

  return (
    <div className="flex h-full min-h-[240px] flex-col bg-slate-950">
      <form
        className="flex gap-2 border-b border-slate-800 p-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (isHost) {
            setChannel(channelInput.trim() || channel);
          }
        }}
      >
        <Input
          value={channelInput}
          onChange={(event) => setChannelInput(event.target.value)}
          placeholder="Twitch channel"
          disabled={!isHost}
        />
        <Button type="submit" size="sm" disabled={!isHost}>
          Load
        </Button>
      </form>
      <iframe title="Twitch" src={src} className="min-h-0 flex-1 border-0" allowFullScreen />
    </div>
  );
}

export function ExcalidrawActivity(_props: ActivityProps) {
  const [url] = useState(() => {
    const room = Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(11)))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    return `https://excalidraw.com/#room=${room},${secret}`;
  });

  return (
    <div className="flex h-full min-h-[240px] flex-col bg-slate-950">
      <div className="border-b border-slate-800 px-3 py-2 text-xs text-slate-400">
        Excalidraw room (iframe). Collaboration uses Excalidraw&apos;s own sync.
      </div>
      <iframe title="Excalidraw" src={url} className="min-h-0 flex-1 border-0" allow="clipboard-write" />
    </div>
  );
}

export function SharedIframeActivity({ isHost }: ActivityProps) {
  const [input, setInput] = useState("https://example.com");
  const [url, setUrl] = useState("https://example.com");

  return (
    <div className="flex h-full min-h-[240px] flex-col bg-slate-950">
      <form
        className="flex gap-2 border-b border-slate-800 p-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (isHost) {
            setUrl(addHttps(input));
          }
        }}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="https://..."
          disabled={!isHost}
        />
        <Button type="submit" size="sm" disabled={!isHost}>
          Load
        </Button>
      </form>
      <iframe title="Shared browser" src={url} className="min-h-0 flex-1 border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
    </div>
  );
}
