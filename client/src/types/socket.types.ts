import type { Socket } from "socket.io-client";
import type { ConversationUser } from "@/services/conversations.service";

// ============================================
// SERVER → CLIENT EVENTS (What we receive)
// ============================================
export interface ServerToClientEvents {
  // Messages
  "message:received": (data: MessageReceivedData) => void;
  "message:edited": (data: MessageEditedData) => void;
  "message:deleted": (data: MessageDeletedData) => void;
  "messages:read": (data: MessagesReadData) => void;

  // Reactions
  "message:reaction": (data: MessageReactionData) => void;

  // Typing indicators
  "user:typing": (data: TypingData) => void;

  // User status
  "user:status": (data: UserStatusData) => void;

  // Read receipts
  "user:read-receipt": (data: ReadReceiptData) => void;

  // Call events
  "call:offer": (data: CallOfferData) => void;
  "call:answer": (data: CallAnswerData) => void;
  "call:ice-candidate": (data: CallIceCandidateData) => void;
  "call:declined": (data: CallEndData) => void;
  "call:ended": (data: CallEndData) => void;

  // Errors
  error: (error: { message: string }) => void;
}

// ============================================
// CLIENT → SERVER EVENTS (What we send)
// ============================================
export interface ClientToServerEvents {
  // Conversation management
  "conversation:open": (conversationId: string) => void;
  "conversation:close": (conversationId: string) => void;

  // Messages
  "message:send": (data: SendMessageData) => void;
  "message:edit": (data: EditMessageData) => void;
  "message:delete": (data: DeleteMessageData) => void;
  "message:read": (data: ReadMessageData) => void;

  // Reactions
  "message:react": (data: ReactMessageData) => void;

  // Typing indicators
  "typing:start": (conversationId: string) => void;
  "typing:stop": (conversationId: string) => void;

  // User status
  "user:online": () => void;

  // Call events
  "call:offer": (data: CallOfferSendData) => void;
  "call:answer": (data: CallAnswerSendData) => void;
  "call:ice-candidate": (data: CallIceCandidateSendData) => void;
  "call:decline": (data: CallEndSendData) => void;
  "call:end": (data: CallEndSendData) => void;
}

// ============================================
// DATA TYPES
// ============================================

export interface MessageReceivedData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "SYSTEM_MESSAGE";
  mediaUrls?: string[];
  status: "SENT" | "DELIVERED" | "READ" | "FAILED";
  createdAt: Date | string;
  sender: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface MessageEditedData {
  messageId: string;
  conversationId: string;
  newContent: string;
  isEdited: boolean;
  editedAt: Date | string;
}

export interface MessageDeletedData {
  messageId: string;
  conversationId: string;
}

export interface MessagesReadData {
  conversationId: string;
  userId: string;
  readAt: Date | string;
}

export interface MessageReactionData {
  messageId: string;
  conversationId: string;
  userId: string;
  emoji: string;
  removed: boolean;
}

export interface TypingData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface UserStatusData {
  userId: string;
  status: "online" | "offline" | "away";
}

export interface ReadReceiptData {
  conversationId: string;
  userId: string;
  messageIds: string[];
  readAt: Date | string;
}

// ============================================
// EMIT DATA TYPES
// ============================================

export interface SendMessageData {
  conversationId: string;
  content: string;
  type?: "TEXT" | "IMAGE" | "VIDEO" | "FILE";
  mediaUrls?: string[];
}

export interface EditMessageData {
  messageId: string;
  conversationId: string;
  newContent: string;
}

export interface DeleteMessageData {
  messageId: string;
  conversationId: string;
}

export interface ReadMessageData {
  conversationId: string;
  messageIds: string[];
}

export interface ReactMessageData {
  messageId: string;
  conversationId: string;
  emoji: string;
}

// ============================================
// CALL DATA TYPES
// ============================================

// Server -> Client
export interface CallOfferData {
  from: string;
  offer: RTCSessionDescriptionInit;
  callType: "AUDIO" | "VIDEO";
  conversationId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

export interface CallAnswerData {
  from: string;
  answer: RTCSessionDescriptionInit;
  conversationId: string;
}

export interface CallIceCandidateData {
  from: string;
  candidate: RTCIceCandidateInit;
  conversationId: string;
}

export interface CallEndData {
  from: string;
  conversationId: string;
}

// Client -> Server
export interface CallOfferSendData {
  conversationId: string;
  offer: RTCSessionDescriptionInit;
  to: string;
  callType: "AUDIO" | "VIDEO";
}

export interface CallAnswerSendData {
  conversationId: string;
  answer: RTCSessionDescriptionInit;
  to: string;
}

export interface CallIceCandidateSendData {
  conversationId?: string;
  candidate: RTCIceCandidateInit;
  to: string;
}

export interface CallEndSendData {
  conversationId: string;
  to: string;
}

// ============================================
// TYPED SOCKET
// ============================================

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// ============================================
// CONNECTION STATE
// ============================================

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export interface SocketState {
  status: ConnectionStatus;
  error: string | null;
  lastConnected: Date | null;
  reconnectAttempts: number;
}

// ============================================
// EVENT HANDLERS (for dependency injection)
// ============================================

export interface SocketEventHandlers {
  onMessageReceived: (data: MessageReceivedData) => void;
  onMessageEdited: (data: MessageEditedData) => void;
  onMessageDeleted: (data: MessageDeletedData) => void;
  onMessagesRead: (data: MessagesReadData) => void;
  onReaction: (data: MessageReactionData) => void;
  onTyping: (data: TypingData) => void;
  onUserStatus: (data: UserStatusData) => void;
  onReadReceipt: (data: ReadReceiptData) => void;
  onError: (error: { message: string }) => void;
}
