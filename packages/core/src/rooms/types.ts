export type MemberRole = "host" | "member" | "guest";

export interface RoomUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: MemberRole;
}

export interface RoomSummary {
  id: string;
  slug: string;
  name: string;
  hostId: string;
  createdAt: string;
}

export interface RoomDetails extends RoomSummary {
  members: RoomUser[];
}

export interface CreateRoomInput {
  name: string;
}

export interface JoinRoomResponse {
  room: RoomSummary;
  member: RoomUser;
}
