import { socketClient } from "./client";
import type {
  ClientToServerEvents,
  SendMessageData,
  EditMessageData,
  DeleteMessageData,
  ReadMessageData,
  ReactMessageData,
} from "@/types/socket.types";

type EmitKey = keyof ClientToServerEvents;
type EmitParams<K extends EmitKey> = Parameters<ClientToServerEvents[K]>;

class SocketEmitters {
  /**
   * Generic emit function with connection check
   */
  private emit<K extends EmitKey>(event: K, ...args: EmitParams<K>): boolean {
    const socket = socketClient.getSocket();

    // ❌ Not connected - don't send
    if (!socket || !socketClient.isConnected()) {
      console.warn(`Cannot emit ${event}: socket not connected`);
      return false;
    }

    try {
      socket.emit(event, ...args);
      return true;
    } catch (error) {
      console.error(`Emit error for ${event}:`, error);
      return false;
    }
  }

  // ============================================
  // CONVERSATION MANAGEMENT
  // ============================================

  openConversation(conversationId: string): boolean {
    return this.emit("conversation:open", conversationId);
  }

  closeConversation(conversationId: string): boolean {
    return this.emit("conversation:close", conversationId);
  }

  // ============================================
  // MESSAGES
  // ============================================

  sendMessage(data: SendMessageData): boolean {
    return this.emit("message:send", data);
  }

  editMessage(data: EditMessageData): boolean {
    return this.emit("message:edit", data);
  }

  deleteMessage(data: DeleteMessageData): boolean {
    return this.emit("message:delete", data);
  }

  readMessage(data: ReadMessageData): boolean {
    return this.emit("message:read", data);
  }

  // ============================================
  // REACTIONS
  // ============================================

  reactToMessage(data: ReactMessageData): boolean {
    return this.emit("message:react", data);
  }

  // ============================================
  // TYPING INDICATORS
  // ============================================

  typingStart(conversationId: string): boolean {
    return this.emit("typing:start", conversationId);
  }

  typingStop(conversationId: string): boolean {
    return this.emit("typing:stop", conversationId);
  }

  // ============================================
  // USER STATUS
  // ============================================

  userOnline(): boolean {
    return this.emit("user:online");
  }
}

// Export singleton instance
export const socketEmitters = new SocketEmitters();
