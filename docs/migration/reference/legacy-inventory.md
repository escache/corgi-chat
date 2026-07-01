# Legacy Code Inventory

Map legacy components to migration phases. Agents should **port UI/UX**, not networking logic.

## Port (UI and product behavior)

| Legacy path | Target package | Phase |
|-------------|----------------|-------|
| `components/Home/` | `packages/ui/lobby` | 1 |
| `components/Group/components/Preview/` | `packages/ui/room/preview` | 2 |
| `components/Group/components/BasicView/components/TiledVideoLayout/` | `packages/ui/room/video-grid` | 2 |
| `components/Group/components/BasicView/components/PinnedVideoLayout/` | `packages/ui/room/pinned-layout` | 2 |
| `components/Group/components/VideoControls/` | `packages/ui/room/controls` | 2 |
| `components/Group/components/Sidebar/` | `packages/ui/room/sidebar` | 2 |
| `components/Group/components/Chat/` | `packages/ui/chat` | 3 |
| `components/Group/components/Chat/components/GiphySearch/` | `packages/ui/chat/giphy` | 3 |
| `components/Group/components/Chat/components/EmojiPicker/` | `packages/ui/chat/emoji` | 3 |
| `components/Group/components/Activities/` | `packages/ui/activities` | 4 |
| `components/Hotkeys/` | `packages/ui/room/hotkeys` | 5 |
| `components/Group/components/MediaSettingsModal/` | `packages/ui/room/media-settings` | 5 |
| `public/*.mp3` (join/leave sounds) | `apps/web/public/sounds/` | 2 |

## Retire (replace with managed services)

| Legacy path | Replacement |
|-------------|-------------|
| `packages/server/src/index.ts` | LiveKit + Supabase |
| `components/Group/lib/useSocketHandler/` | `@livekit/components-react` |
| `components/Group/lib/useSocketHandler/lib/onPeerCreated.ts` | LiveKit participant tracks |
| `components/Group/lib/SocketContext.tsx` | Remove |
| `components/Firebase/Firebase.tsx` | Clerk + Supabase |
| `lib/hooks/useUser.ts` (Firebase) | Clerk `useUser()` |
| `lib/hooks/useGroup.ts` (Firebase) | `packages/core/rooms` + Drizzle |
| `simple-peer` dependency | LiveKit SDK |

## Feature parity checklist

- [ ] Create room from home page
- [ ] Join room by slug URL
- [ ] Pre-join preview (camera/mic)
- [ ] Tiled video layout
- [ ] Pinned speaker layout
- [ ] Mute / camera toggle
- [ ] Screen share
- [ ] Sidebar participant list
- [ ] Text chat with history
- [ ] GIF search (Giphy)
- [ ] Emoji picker
- [ ] Draw activity sync
- [ ] YouTube sync activity
- [ ] Twitch / iframe activities
- [ ] Join/leave sounds
- [ ] Keyboard shortcuts
- [ ] Host/admin controls
