# Phase 4 — Activities

**Prerequisites:** Phase 2 complete (LiveKit data channels available); Phase 3 recommended  
**Branch:** `cursor/phase-04-activities-e8a0`  
**Next phase:** `05-polish-cutover.md`

---

## PROMPT START

You are a senior full-stack engineer executing **Phase 4: Activities** of the corgi-chat migration.

### Context

Read before writing any code:
- `docs/migration/reference/target-architecture.md`
- `docs/migration/reference/legacy-inventory.md`
- `legacy/client/src/components/Group/components/Activities/` — port activity UX
- `legacy/client/src/components/Group/components/Activities/lib/activityData.ts` — activity registry

Legacy activities used Socket.IO events:
- `DrawActivity::drawing` / `DrawActivity::receivedDrawing`
- `sendYoutubeSyncData` / `receivedYoutubeSyncData`
- iframe embeds for Twitch, Excalidraw, SharedIframe

**Replace socket sync with LiveKit data channels** for draw and YouTube. Keep iframe embeds for passive activities.

### Objective

Restore collaborative activities: draw on shared canvas and synced YouTube playback for 3+ users.

### Scope

**In scope:**
- `packages/core/activities/` — plugin interface:
  ```ts
  interface ActivityPlugin {
    id: string;
    label: string;
    component: React.ComponentType<ActivityProps>;
    requiresSync: boolean;
  }
  ```
- Activity registry (port IDs from legacy: Youtube, Twitch, Draw, Excalidraw, SharedIframe)
- `packages/ui/activities/`:
  - `activity-chooser-modal` (port from legacy)
  - `draw` — canvas with LiveKit data channel sync
  - `youtube` — synced playback via data channel (host is controller)
  - `twitch`, `excalidraw`, `shared-iframe` — iframe embeds (no sync required initially)
- Host election: room host (from `room_members.role`) controls YouTube playback
- Activity state in room UI: split view between video grid and active activity

**Out of scope:**
- Dominion game (legacy listed it — skip unless trivial iframe)
- Full Excalidraw sync (iframe only for now)
- Desktop WebView for iframes (Phase 6)
- Deleting legacy socket server (Phase 5)

### Tasks (execute in order)

1. **Inspect** Phase 2 room UI — identify where activity pane mounts.
2. **Define** activity plugin interface in `packages/core/activities/types.ts`.
3. **Registry** — `packages/core/activities/registry.ts` with activity metadata.
4. **Chooser** — port `ActivityChooserModal` to shadcn; launch from sidebar button.
5. **Draw activity:**
   - HTML canvas component
   - Serialize stroke events: `{ type: 'stroke', x0, y0, x1, y1, color, userId }`
   - Send via LiveKit `localParticipant.publishData()` (reliable)
   - Subscribe via `RoomEvent.DataReceived`
   - Port throttle logic from legacy if needed
6. **YouTube activity:**
   - Embed `react-youtube` or iframe API
   - Host-only controls: play, pause, seek
   - Broadcast state `{ type: 'yt-sync', action, timestamp, videoId }` via data channel
   - Non-host clients apply state without echo
7. **Passive iframes** — Twitch, Excalidraw, SharedIframe as URL/embed inputs.
8. **Layout** — resizable split between video and activity (port `DraggableSplitWrapper` concept).
9. **Test** with 3 users:
   - Draw: all see strokes in real time
   - YouTube: host play/pause syncs to others
10. **Commit**, push, update PR.

### Constraints

- Data channel messages must be JSON and <15KB per packet.
- Include `userId` and `activityId` in every data message to prevent cross-activity bleed.
- Do not use Socket.IO for any activity sync.
- Host-only YouTube control — non-hosts cannot seek (read-only UI).

### Verification checklist

- [ ] Activity chooser opens and lists activities
- [ ] Draw: 3 users see each other's strokes in real time
- [ ] YouTube: host play/pause syncs to 2 other users
- [ ] Twitch/Excalidraw/iframe loads in activity pane
- [ ] Switching activities cleans up listeners/subscriptions
- [ ] Leaving room does not throw errors from stale activity handlers
- [ ] `pnpm lint` and `pnpm typecheck` pass
- [ ] PR updated with Phase 4 summary

### Deliverables

1. PR URL
2. Data channel message schema documented
3. Manual test results for draw + YouTube with 3 users
4. Verification checklist pass/fail
5. List of activities implemented vs deferred

### Handoff

Next agent session: **`docs/migration/phases/05-polish-cutover.md`**

## PROMPT END
