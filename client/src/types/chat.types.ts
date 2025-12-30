// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio?: string | null;
  status: "online" | "offline" | "away";
  role?: "ADMIN" | "USER";
  createdAt: string | Date;
}

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "FILE"
  | "SYSTEM_MESSAGE";
export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "FAILED";

export interface MessageSender {
  id: string;
  name: string | null;
  avatar: string | null;
}

export interface MessageRead {
  userId: string;
  readAt: string | Date;
  user?: User;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string | Date;
  user?: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  mediaUrls: string[];
  status: MessageStatus;
  isEdited: boolean;
  editedAt: string | Date | null;
  editedContent: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  sender: MessageSender;
  readBy?: MessageRead[];
  reactions?: MessageReaction[];
}

// ============================================
// CONVERSATION TYPES
// ============================================

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  isArchived: boolean;
  isMuted: boolean;
  lastReadAt: string | Date | null;
  joinedAt: string | Date;
  user: User;
}

export interface Conversation {
  id: string;
  isArchived: boolean;
  lastMessageAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  participants: ConversationParticipant[];
  messages: Message[];
}

// ============================================
// REACT QUERY RESPONSE TYPES
// ============================================

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface MessagesPageResponse {
  messages: Message[];
  nextCursor?: string;
}

export interface InfiniteMessagesData {
  pages: Message[][];
  pageParams: unknown[];
}

export interface InfiniteConversationsData {
  pages: Conversation[][];
  pageParams: unknown[];
}
