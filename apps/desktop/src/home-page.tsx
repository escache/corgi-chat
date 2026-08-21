import {
  createGuestSession,
  createRoom,
  setAuthToken,
  usePlatform,
} from "@corgi-chat/core";
import { HomeLobby } from "@corgi-chat/ui";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export function HomePage() {
  const navigate = useNavigate();
  const platform = usePlatform();
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [recentRooms, setRecentRooms] = useState<Array<{ slug: string; name: string }>>([]);

  useEffect(() => {
    const unlisten = listen<string>("navigate-to-room", (event) => {
      navigate(`/r/${event.payload}`);
    });

    void loadRecentRooms();

    const deepLinkUnsub = platform.onDeepLink((url) => {
      const match = url.match(/^corgi-chat:\/\/r\/(.+)$/);
      if (match?.[1]) {
        navigate(`/r/${match[1]}`);
      }
    });

    return () => {
      void unlisten.then((off) => off());
      deepLinkUnsub?.();
    };
  }, [navigate, platform]);

  async function loadRecentRooms() {
    try {
      const rooms = await invoke<Array<{ slug: string; name: string }>>("get_recent_rooms");
      setRecentRooms(rooms);
    } catch {
      setRecentRooms([]);
    }
  }

  async function handleContinueAsGuest(displayName: string) {
    setError(null);
    try {
      const { guestToken } = await createGuestSession(displayName);
      setAuthToken(guestToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start guest session");
      throw err;
    }
  }

  async function handleCreateRoom(name: string) {
    setIsCreating(true);
    setError(null);
    try {
      const room = await createRoom({ name });
      await invoke("add_recent_room", { slug: room.slug, name: room.name });
      void loadRecentRooms();
      navigate(`/r/${room.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create room");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="h-screen w-screen overflow-y-auto">
      <HomeLobby
        isSignedIn={false}
        onContinueAsGuest={handleContinueAsGuest}
        onCreateRoom={handleCreateRoom}
        isCreating={isCreating}
        error={error}
      />

      {recentRooms.length > 0 ? (
        <div className="absolute bottom-6 left-6 rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
          <h3 className="text-sm font-semibold text-slate-300">Recent rooms</h3>
          <ul className="mt-2 space-y-1">
            {recentRooms.map((room) => (
              <li key={room.slug}>
                <button
                  type="button"
                  onClick={() => navigate(`/r/${room.slug}`)}
                  className="text-sm text-violet-300 hover:text-violet-200"
                >
                  {room.name || room.slug}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
