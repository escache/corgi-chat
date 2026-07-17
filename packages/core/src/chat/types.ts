export type MessageType = "text" | "gif" | "system";

export interface ChatAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string | null;
  body: string;
  type: MessageType;
  metadata: Record<string, unknown>;
  createdAt: string;
  author: ChatAuthor | null;
}

export interface MessagesPage {
  messages: ChatMessage[];
  hasMore: boolean;
}

export interface SendMessageInput {
  body: string;
  type?: "text" | "gif";
  metadata?: Record<string, unknown>;
}
