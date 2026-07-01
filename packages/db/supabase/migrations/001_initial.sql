-- Corgi Chat initial schema + RLS
-- Run in Supabase SQL editor or via drizzle-kit push

CREATE TYPE member_role AS ENUM ('host', 'member', 'guest');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE,
  guest_token TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_identity_check CHECK (clerk_id IS NOT NULL OR guest_token IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_members (
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS rooms_slug_idx ON rooms(slug);
CREATE INDEX IF NOT EXISTS room_members_room_id_idx ON room_members(room_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; these policies apply to anon/authenticated Supabase clients.
-- Server-side API uses DATABASE_URL (service role) for writes.

CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (true);

CREATE POLICY "rooms_read_if_member" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = rooms.id
        AND room_members.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "room_members_read_if_member" ON room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members AS rm
      WHERE rm.room_id = room_members.room_id
        AND rm.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "rooms_update_host" ON rooms
  FOR UPDATE USING (host_id = auth.uid()::uuid);
