import type { TypedSocket, SocketEventHandlers } from "@/types/socket.types";

/**
 * Register all socket event listeners
 * Uses dependency injection - handlers are passed in from provider
 * This makes testing easier and keeps socket logic separate from UI logic
 */
export const registerSocketEvents = (
  socket: TypedSocket,
  handlers: SocketEventHandlers
): (() => void) => {
  // ============================================
  // REGISTER ALL LISTENERS
  // ============================================

  socket.on("message:received", handlers.onMessageReceived);
  socket.on("message:edited", handlers.onMessageEdited);
  socket.on("message:deleted", handlers.onMessageDeleted);
  socket.on("messages:read", handlers.onMessagesRead);
  socket.on("message:reaction", handlers.onReaction);
  socket.on("user:typing", handlers.onTyping);
  socket.on("user:status", handlers.onUserStatus);
  socket.on("user:read-receipt", handlers.onReadReceipt);
  socket.on("error", handlers.onError);

  // ============================================
  // RETURN CLEANUP FUNCTION
  // ============================================

  return () => {
    socket.off("message:received", handlers.onMessageReceived);
    socket.off("message:edited", handlers.onMessageEdited);
    socket.off("message:deleted", handlers.onMessageDeleted);
    socket.off("messages:read", handlers.onMessagesRead);
    socket.off("message:reaction", handlers.onReaction);
    socket.off("user:typing", handlers.onTyping);
    socket.off("user:status", handlers.onUserStatus);
    socket.off("user:read-receipt", handlers.onReadReceipt);
    socket.off("error", handlers.onError);
  };
};
