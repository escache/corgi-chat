"use client";

import type { ChatMessage } from "@corgi-chat/core";
import { fetchMessages, useMessages, useSendMessage } from "@corgi-chat/core";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Theme } from "emoji-picker-react";

import { Button } from "../components/button";
import { Card } from "../components/card";
import { Input } from "../components/input";
import { cn } from "../lib/cn";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

export interface ChatPanelProps {
  roomSlug: string;
  enabled?: boolean;
  giphyApiKey?: string;
  /** Compact sidebar layout for in-call view */
  compact?: boolean;
  className?: string;
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

export function ChatPanel({
  roomSlug,
  enabled = true,
  giphyApiKey,
  compact = false,
  className,
}: ChatPanelProps) {
  const messagesQuery = useMessages(roomSlug, enabled);
  const sendMessage = useSendMessage(roomSlug);
  const [draft, setDraft] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState<Array<{ url: string; title: string }>>([]);
  const [earlierMessages, setEarlierMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const stickToBottomRef = useRef(true);

  const liveMessages = messagesQuery.data?.messages ?? [];
  const allMessages = [...earlierMessages, ...liveMessages].filter(
    (message, index, list) => list.findIndex((item) => item.id === message.id) === index,
  );

  useEffect(() => {
    if (messagesQuery.data) {
      setHasMore(messagesQuery.data.hasMore);
    }
  }, [messagesQuery.data]);

  useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottomRef.current) {
      list.scrollTop = list.scrollHeight;
    }
  }, [allMessages.length]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sendMessage.isPending) {
      return;
    }

    setDraft("");
    stickToBottomRef.current = true;
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
    stickToBottomRef.current = true;
    await sendMessage.mutateAsync({
      body: title || "GIF",
      type: "gif",
      metadata: { gifUrl },
    });
    setGifResults([]);
    setGifQuery("");
    setShowGiphy(false);
  };

  const loadEarlier = async () => {
    if (!allMessages.length || loadingEarlier) {
      return;
    }

    setLoadingEarlier(true);
    stickToBottomRef.current = false;
    try {
      const oldest = allMessages[0];
      const page = await fetchMessages(roomSlug, { before: oldest.createdAt, limit: 50 });
      setEarlierMessages((current) => [...page.messages, ...current]);
      setHasMore(page.hasMore);
    } finally {
      setLoadingEarlier(false);
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden p-0",
        compact ? "min-h-0 h-full" : "min-h-[360px]",
        className,
      )}
    >
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-lg font-semibold">Chat</h2>
        {!compact ? (
          <p className="text-xs text-slate-500">Messages are saved for everyone in the room.</p>
        ) : null}
      </div>

      <ul
        ref={listRef}
        className="flex-1 space-y-1 overflow-y-auto px-4 py-3"
        onScroll={(event) => {
          const target = event.currentTarget;
          stickToBottomRef.current =
            target.scrollHeight - target.scrollTop - target.clientHeight < 48;
        }}
      >
        {hasMore ? (
          <li className="pb-2 text-center">
            <button
              type="button"
              className="text-xs text-violet-300 hover:text-violet-200 disabled:opacity-50"
              disabled={loadingEarlier}
              onClick={() => void loadEarlier()}
            >
              {loadingEarlier ? "Loading..." : "Load earlier messages"}
            </button>
          </li>
        ) : null}
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
        {allMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ul>

      <div className="border-t border-slate-800 p-3">
        {showEmojis ? (
          <div className="mb-3 overflow-hidden rounded-lg border border-slate-700">
            <Suspense
              fallback={<p className="p-3 text-center text-xs text-slate-500">Loading emojis...</p>}
            >
              <EmojiPicker
                width="100%"
                height={compact ? 280 : 320}
                theme={Theme.DARK}
                searchPlaceHolder="Search emoji"
                previewConfig={{ showPreview: false }}
                onEmojiClick={(emojiData) => {
                  setDraft((value) => `${value}${emojiData.emoji}`);
                  setShowEmojis(false);
                }}
              />
            </Suspense>
          </div>
        ) : null}

        {showGiphy && giphyApiKey ? (
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
                Search
              </Button>
            </div>
            {gifResults.length > 0 ? (
              <div className="grid max-h-40 grid-cols-3 gap-2 overflow-y-auto">
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
            onClick={() => {
              setShowEmojis((value) => !value);
              setShowGiphy(false);
            }}
            aria-label="Emoji picker"
          >
            🙂
          </button>
          {giphyApiKey ? (
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 text-sm text-slate-300 hover:bg-slate-800"
              onClick={() => {
                setShowGiphy((value) => !value);
                setShowEmojis(false);
              }}
              aria-label="GIF search"
            >
              GIF
            </button>
          ) : null}
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
