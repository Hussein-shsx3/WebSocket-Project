import { Server, Socket } from "socket.io";
import { messageService } from "../services/message.service";

export function setupChatSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log(`✅ User ${userId} connected - Socket: ${socket.id}`);

    /**
     * When user OPENS a conversation (joins the room)
     * AUTO-MARK all unread messages as read
     */
    socket.on("conversation:open", async (conversationId: string) => {
      try {
        console.log(`📖 ${userId} opened conversation ${conversationId}`);

        // Join Socket.io room for this conversation
        socket.join(conversationId);

        // ✅ AUTO-MARK all unread messages as READ
        await messageService.markMessagesAsRead(conversationId, userId);

        // Notify other user that messages are read
        socket.to(conversationId).emit("messages:read", {
          conversationId,
          userId,
          readAt: new Date(),
        });

        console.log(`✅ Auto-marked messages as read for ${userId}`);
      } catch (error) {
        console.error("Error in conversation:open:", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    /**
     * When user LEAVES/CLOSES a conversation
     */
    socket.on("conversation:close", (conversationId: string) => {
      console.log(`👋 ${userId} closed conversation ${conversationId}`);
      socket.leave(conversationId);
    });

    /**
     * When a NEW MESSAGE is SENT
     * Save message and broadcast to conversation room
     * NOTE: Real-time only - no auto-mark here
     * Clients will mark as read via HTTP or conversation:open event
     */
    socket.on("message:send", async (data: any) => {
      try {
        const { conversationId, content, type = "TEXT", mediaUrls = [] } = data;

        console.log(`📨 Message from ${userId} in ${conversationId}`);

        // Save message to database
        const message = await messageService.sendMessage(
          conversationId,
          userId,
          content,
          type,
          mediaUrls
        );

        // Broadcast message to ALL users (including sender for confirmation)
        io.to(conversationId).emit("message:received", {
          id: message.id,
          conversationId,
          senderId: userId,
          content: message.content,
          type: message.type,
          status: "SENT",
          createdAt: message.createdAt,
          sender: {
            id: userId,
            name: message.sender?.name,
            avatar: message.sender?.avatar,
          },
        });

        console.log(`📤 Message broadcasted to ${conversationId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    /**
     * Socket.IO does NOT handle message:received
     * This is a real-time push event from server only
     * Clients acknowledge with HTTP POST /mark-as-read or via conversation:open
     */
    // Note: Removed message:received handler - this is server->client only

    /**
     * When a MESSAGE is EDITED
     * Broadcast edit to all users in conversation
     */
    socket.on("message:edit", async (data: any) => {
      try {
        const { messageId, conversationId, newContent } = data;

        console.log(`✏️ User ${userId} editing message ${messageId}`);

        // Update in database via service
        const updatedMessage = await messageService.editMessage(messageId, userId, newContent);

        // Broadcast edit to conversation
        io.to(conversationId).emit("message:edited", {
          messageId,
          conversationId,
          newContent: updatedMessage.content,
          isEdited: true,
          editedAt: updatedMessage.editedAt,
        });

        console.log(`✅ Message edit broadcasted to ${conversationId}`);
      } catch (error) {
        console.error("Error editing message:", error);
        socket.emit("error", { message: "Failed to edit message" });
      }
    });

    /**
     * When a MESSAGE is DELETED
     * Broadcast deletion to all users in conversation
     */
    socket.on("message:delete", async (data: any) => {
      try {
        const { messageId, conversationId } = data;

        console.log(`🗑️ User ${userId} deleting message ${messageId}`);

        // Delete from database via service
        await messageService.deleteMessage(messageId, userId);

        // Broadcast deletion to conversation
        io.to(conversationId).emit("message:deleted", {
          messageId,
          conversationId,
        });

        console.log(`✅ Message deletion broadcasted to ${conversationId}`);
      } catch (error) {
        console.error("Error deleting message:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    /**
     * Typing indicator - REAL-TIME ONLY (no database)
     */
    socket.on("typing:start", (conversationId: string) => {
      console.log(`⌨️ ${userId} is typing in ${conversationId}`);
      socket.to(conversationId).emit("user:typing", {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (conversationId: string) => {
      console.log(`⌨️ ${userId} stopped typing in ${conversationId}`);
      socket.to(conversationId).emit("user:typing", {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    /**
     * Message read receipt - REAL-TIME ONLY
     * Notify other users that messages are read
     */
    socket.on("message:read", (data: any) => {
      try {
        const { conversationId, messageIds } = data;

        console.log(`👁️ ${userId} read messages in ${conversationId}`);

        // Broadcast read receipt to other users
        socket.to(conversationId).emit("user:read-receipt", {
          conversationId,
          userId,
          messageIds,
          readAt: new Date(),
        });

        console.log(`✅ Read receipt broadcasted to ${conversationId}`);
      } catch (error) {
        console.error("Error broadcasting read receipt:", error);
      }
    });

    /**
     * Message reactions - REAL-TIME + DATABASE
     * Broadcast reactions to all users in conversation
     */
    socket.on("message:react", async (data: any) => {
      try {
        const { messageId, conversationId, emoji } = data;

        console.log(`😊 ${userId} reacted with ${emoji} to message ${messageId}`);

        // Save/toggle reaction in database
        const reaction = await messageService.reactToMessage(messageId, userId, emoji);

        // Broadcast reaction to conversation
        io.to(conversationId).emit("message:reaction", {
          messageId,
          conversationId,
          userId,
          emoji,
          removed: (reaction as any).removed || false,
        });

        console.log(`✅ Reaction broadcasted to ${conversationId}`);
      } catch (error) {
        console.error("Error reacting to message:", error);
        socket.emit("error", { message: "Failed to react to message" });
      }
    });

    /**
     * User comes online
     */
    socket.on("user:online", () => {
      console.log(`🟢 ${userId} is online`);
      io.emit("user:status", { userId, status: "online" });
    });

    /**
     * User goes offline
     */
    socket.on("disconnect", () => {
      console.log(`🔴 ${userId} disconnected`);
      io.emit("user:status", { userId, status: "offline" });
    });
  });
}
