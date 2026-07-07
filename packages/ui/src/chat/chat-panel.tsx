"use client";

import type { ChatMessage } from "@corgi-chat/core";
import { useMessages, useSendMessage } from "@corgi-chat/core";
import { useEffect, useRef, useState } from "react";

import { Button } from "../components/button";
import { Card } from "../components/card";
import { Input } from "../components/input";

const QUICK_EMOJIS = ["😀", "😂", "❤️", "👍", "🎉", "🔥", "👋", "😮"];

export interface ChatPanelProps {
  roomSlug: string;
  enabled?: boolean;
  giphyApiKey?: string;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.type === "system") {
    return (
      <li className="py-1 text-center text-xs text-slate-500">{message.body}</li>
    );
  }

  const gifUrl =
    message.type === "gif" && typeof message.metadata.gifUrl === "string"
      ? message.metadata.gifUrl
      : null;

  return (
    <li className="flex gap-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs font-semibold text-violet-200">
        {(message.author?.displayName ?? "?").slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-white">
            {message.author?.displayName ?? "Unknown"}
          </span>
          <span className="text-xs text-slate-500">{formatTime(message.createdAt)}</span>
        </div>
        {gifUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gifUrl} alt={message.body || "GIF"} className="mt-2 max-h-48 rounded-lg" />
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-200">
            {message.body}
          </p>
        )}
      </div>
    </li>
  );
}

export function ChatPanel({ roomSlug, enabled = true, giphyApiKey }: ChatPanelProps) {
  const messagesQuery = useMessages(roomSlug, enabled);
  const sendMessage = useSendMessage(roomSlug);
  const [draft, setDraft] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState<Array<{ url: string; title: string }>>([]);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messagesQuery.data?.messages.length]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sendMessage.isPending) {
      return;
    }

    setDraft("");
    try {
      await sendMessage.mutateAsync({ body, type: "text" });
    } catch {
      setDraft(body);
    }
  };

  const searchGifs = async () => {
    if (!giphyApiKey || !gifQuery.trim()) {
      return;
    }

    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(gifQuery)}&limit=12&rating=g`,
    );
    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as {
      data: Array<{ title: string; images: { fixed_height: { url: string } } }>;
    };

    setGifResults(
      data.data.map((item) => ({
        title: item.title,
        url: item.images.fixed_height.url,
      })),
    );
  };

  const sendGif = async (gifUrl: string, title: string) => {
    await sendMessage.mutateAsync({
      body: title || "GIF",
      type: "gif",
      metadata: { gifUrl },
    });
    setGifResults([]);
    setGifQuery("");
  };

  return (
    <Card className="flex min-h-[360px] flex-col overflow-hidden p-0">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-lg font-semibold">Chat</h2>
        <p className="text-xs text-slate-500">Messages are saved for everyone in the room.</p>
      </div>

      <ul ref={listRef} className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
        {messagesQuery.isLoading ? (
          <li className="text-sm text-slate-500">Loading messages...</li>
        ) : null}
        {messagesQuery.isError ? (
          <li className="text-sm text-red-400">
            {messagesQuery.error instanceof Error
              ? messagesQuery.error.message
              : "Could not load messages"}
          </li>
        ) : null}
        {messagesQuery.data?.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ul>

      <div className="border-t border-slate-800 p-4">
        {showEmojis ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded-md bg-slate-800 px-2 py-1 text-lg hover:bg-slate-700"
                onClick={() => setDraft((value) => `${value}${emoji}`)}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}

        {giphyApiKey ? (
          <div className="mb-3 space-y-2">
            <div className="flex gap-2">
              <Input
                value={gifQuery}
                onChange={(event) => setGifQuery(event.target.value)}
                placeholder="Search GIFs"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void searchGifs();
                  }
                }}
              />
              <Button variant="secondary" onClick={() => void searchGifs()}>
                GIF
              </Button>
            </div>
            {gifResults.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {gifResults.map((gif) => (
                  <button
                    key={gif.url}
                    type="button"
                    className="overflow-hidden rounded-md"
                    onClick={() => void sendGif(gif.url, gif.title)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gif.url} alt={gif.title} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-700 px-3 text-sm text-slate-300 hover:bg-slate-800"
            onClick={() => setShowEmojis((value) => !value)}
          >
            🙂
          </button>
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Send a message"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
          />
          <Button onClick={() => void handleSend()} disabled={sendMessage.isPending || !draft.trim()}>
            Send
          </Button>
        </div>
        {sendMessage.isError ? (
          <p className="mt-2 text-xs text-red-400">
            {sendMessage.error instanceof Error ? sendMessage.error.message : "Failed to send"}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
