# Phase 3 — Persistent Chat

**Prerequisites:** Phase 2 complete (users can join video calls)  
**Branch:** `cursor/phase-03-persistent-chat-e8a0`  
**Next phase:** `04-activities.md`

---

## PROMPT START

You are a senior full-stack engineer executing **Phase 3: Persistent Chat** of the corgi-chat migration.

### Context

Read before writing any code:
- `docs/migration/reference/target-architecture.md`
- `docs/migration/reference/legacy-inventory.md`
- `legacy/client/src/components/Group/components/Chat/` — port chat UI
- `legacy/client/src/components/Group/components/Chat/components/GiphySearch/`
- `legacy/client/src/components/Group/components/Chat/components/EmojiPicker/`

Legacy chat used ephemeral Socket.IO broadcasts (`sendChatMessage`). New chat must **persist to Postgres** and deliver via Supabase Realtime.

### Objective

Users send text messages and GIFs in a room; messages persist and reload for late joiners.

### Scope

**In scope:**
- Drizzle schema: `messages` table
- API: `GET /api/rooms/[slug]/messages` (paginated), `POST /api/rooms/[slug]/messages`
- Supabase Realtime subscription on `messages` INSERT for live delivery
- `packages/ui/chat/`:
  - message list with scroll-to-bottom
  - input with send on Enter
  - emoji picker (port from legacy or use `emoji-picker-react`)
  - Giphy search (port from legacy, use `NEXT_PUBLIC_GIPHY_API_KEY`)
- `packages/core/chat` — `useMessages`, `useSendMessage` hooks (TanStack Query + Realtime)
- Chat panel in room UI (collapsible sidebar or split pane — port `DraggableSplitWrapper` UX if feasible)
- System messages: "X joined the room" (optional, type `system`)

**Out of scope:**
- Activities (Phase 4)
- Threads, reactions, edits, deletes
- Deleting legacy socket chat code (Phase 5)
- Desktop-specific chat UI (inherits from `packages/ui`)

### Tasks (execute in order)

1. **Inspect** Phase 2 — confirm in-call room UI has a sidebar/split area for chat.
2. **Schema** — add `messages` table:
   ```sql
   messages (
     id uuid PK,
     room_id uuid FK rooms,
     user_id uuid FK users,
     body text,
     type text CHECK (type IN ('text', 'gif', 'system')),
     metadata_json jsonb,  -- gif URL, dimensions, etc.
     created_at timestamptz
   )
   ```
3. **Index** — `(room_id, created_at DESC)` for pagination.
4. **RLS** — room members can read/write messages for their room.
5. **API GET** — cursor pagination, default 50 messages, `?before=<timestamp>` for infinite scroll.
6. **API POST** — validate membership, insert row, return message with user display info.
7. **Realtime** — client subscribes to `postgres_changes` on `messages` filtered by `room_id`.
8. **UI** — build `packages/ui/chat/chat-panel.tsx`:
   - Port styling/UX from legacy `Chat.tsx`
   - Show avatar, display name, timestamp
   - GIF messages render as images
9. **Giphy** — port search modal; store gif URL in `metadata_json`.
10. **Integration** — add chat panel to in-call room layout.
11. **Test**:
    - User A sends message → User B sees it live
    - User C joins later → sees message history
    - Page reload preserves history
12. **Commit**, push, update PR.

### Constraints

- Messages go through API POST (not direct client Supabase insert) for validation.
- Realtime is for delivery only; API is source of truth.
- Do not use Socket.IO for chat.
- Rate limit message POST if easy (e.g. 10/sec per user) — optional but note if skipped.

### Verification checklist

- [ ] Text message sent by User A appears for User B in <1s
- [ ] Messages persist after page reload
- [ ] Late joiner sees prior messages
- [ ] GIF message renders correctly
- [ ] Emoji picker inserts emoji into input
- [ ] Non-member cannot read/post messages (RLS enforced)
- [ ] `pnpm lint` and `pnpm typecheck` pass
- [ ] PR updated with Phase 3 summary

### Deliverables

1. PR URL
2. Message schema + RLS policy summary
3. Manual test results (3 scenarios above)
4. Verification checklist pass/fail

### Handoff

Next agent session: **`docs/migration/phases/04-activities.md`**

## PROMPT END
