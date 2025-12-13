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

        // Broadcast message to all users in conversation
        io.to(conversationId).emit("message:received", {
          id: message.id,
          conversationId,
          senderId: userId,
          content: message.content,
          type: message.type,
          createdAt: message.createdAt,
          sender: {
            id: userId,
            name: message.sender?.name,
            avatar: message.sender?.avatar,
          },
        });

        // Auto-mark message as read for all users in the room (except sender)
        const room = io.sockets.adapter.rooms.get(conversationId);
        if (room) {
          for (const socketId of room) {
            const recipientSocket = io.sockets.sockets.get(socketId);
            if (recipientSocket && recipientSocket.data.userId !== userId) {
              // Mark message as read for this user
              await messageService.markMessagesAsRead(conversationId, recipientSocket.data.userId);
              console.log(`✅ Auto-marked message as read for ${recipientSocket.data.userId}`);
            }
          }
        }

        console.log(`📤 Message broadcasted to ${conversationId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    /**
     * When a MESSAGE is RECEIVED
     * If user is in conversation: AUTO-MARK as read
     * If user is NOT in conversation: Keep as unread
     */
    socket.on("message:received", async (data: any) => {
      try {
        const { conversationId, messageId } = data;

        // ✅ Only mark as read if user is IN the conversation room
        if (socket.rooms.has(conversationId)) {
          // User is in the conversation - AUTO-MARK as read
          await messageService.markMessagesAsRead(conversationId, userId);

          // Notify sender that message is read
          socket.to(conversationId).emit("message:read", {
            conversationId,
            messageId,
            userId,
            readAt: new Date(),
          });

          console.log(`✅ Auto-marked message as read for ${userId}`);
        } else {
          // User is NOT in the conversation - keep as unread
          console.log(`🔵 Message left unread - ${userId} not in room`);
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    /**
     * Typing indicator
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
      socket.to(conversationId).emit("user:typing", {
        conversationId,
        userId,
        isTyping: false,
      });
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
