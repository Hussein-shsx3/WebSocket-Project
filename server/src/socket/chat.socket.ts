import { Server, Socket } from "socket.io";
import { messageService } from "../services/message.service";
import * as userService from "../services/user.service";

export function setupChatSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    // Join a room with the user's ID for direct notifications (calls, etc.)
    socket.join(userId);

    // connection log removed

    /**
     * When user OPENS a conversation (joins the room)
     * AUTO-MARK all unread messages as read
     */
    socket.on("conversation:open", async (conversationId: string) => {
      try {
        // conversation open log removed

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

        // auto-mark log removed
      } catch (error) {
        console.error("Error in conversation:open:", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    /**
     * When user LEAVES/CLOSES a conversation
     */
    socket.on("conversation:close", (conversationId: string) => {
      // conversation close log removed
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

        // incoming message log removed

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
          mediaUrls: message.mediaUrls || [],
          status: "SENT",
          createdAt: message.createdAt,
          sender: {
            id: userId,
            name: message.sender?.name,
            avatar: message.sender?.avatar,
          },
        });

        // message broadcast log removed
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

        // edit message log removed

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

        // message edit broadcast log removed
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

        // delete message log removed

        // Delete from database via service
        await messageService.deleteMessage(messageId, userId);

        // Broadcast deletion to conversation
        io.to(conversationId).emit("message:deleted", {
          messageId,
          conversationId,
        });

        // message deletion broadcast log removed
      } catch (error) {
        console.error("Error deleting message:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    /**
     * Typing indicator - REAL-TIME ONLY (no database)
     */
    socket.on("typing:start", (conversationId: string) => {
      // typing start log removed
      socket.to(conversationId).emit("user:typing", {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (conversationId: string) => {
      // typing stop log removed
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

        // read receipt log removed

        // Broadcast read receipt to other users
        socket.to(conversationId).emit("user:read-receipt", {
          conversationId,
          userId,
          messageIds,
          readAt: new Date(),
        });

        // read receipt broadcast log removed
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

        // reaction log removed

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

        // reaction broadcast log removed
      } catch (error) {
        console.error("Error reacting to message:", error);
        socket.emit("error", { message: "Failed to react to message" });
      }
    });

    /**
     * User comes online
     */
    socket.on("user:online", async () => {
      // user online log removed
      try {
        // Update status in database
        await userService.updateUserStatus(userId, "online");
        // Broadcast to all clients
        io.emit("user:status", { userId, status: "online" });
      } catch (error) {
        console.error("Error updating user status to online:", error);
      }
    });

    /**
     * =====================================================
     * WebRTC Signaling for Video/Voice Calls
     * =====================================================
     */

    /**
     * Initiate a call - send offer to target user
     */
    socket.on("call:offer", async (data: any) => {
      try {
        const { conversationId, offer, to, callType } = data;
        
        // Get caller info
        const caller = await userService.getUserById(userId);
        
        // Send offer to the target user
        io.to(to).emit("call:offer", {
          from: userId,
          offer,
          callType,
          conversationId,
          user: caller ? {
            id: caller.id,
            name: caller.name,
            avatar: caller.avatar,
          } : null,
        });
        
        console.log(`Call offer sent from ${userId} to ${to}`);
      } catch (error) {
        console.error("Error in call:offer:", error);
        socket.emit("error", { message: "Failed to initiate call" });
      }
    });

    /**
     * Answer a call - send answer to caller
     */
    socket.on("call:answer", async (data: any) => {
      try {
        const { conversationId, answer, to } = data;
        
        console.log(`📞 Call answer received from ${userId}, sending to ${to}`);
        console.log(`📞 Rooms that ${to} should be in:`, io.sockets.adapter.rooms.get(to));
        
        // Send answer to the caller
        io.to(to).emit("call:answer", {
          from: userId,
          answer,
          conversationId,
        });
        
        console.log(`📞 Call answer emitted to room: ${to}`);
      } catch (error) {
        console.error("Error in call:answer:", error);
        socket.emit("error", { message: "Failed to answer call" });
      }
    });

    /**
     * ICE Candidate exchange for WebRTC
     */
    socket.on("call:ice-candidate", async (data: any) => {
      try {
        const { conversationId, candidate, to } = data;
        
        // Forward ICE candidate to the other peer
        io.to(to).emit("call:ice-candidate", {
          from: userId,
          candidate,
          conversationId,
        });
      } catch (error) {
        console.error("Error in call:ice-candidate:", error);
      }
    });

    /**
     * Decline an incoming call
     */
    socket.on("call:decline", async (data: any) => {
      try {
        const { conversationId, to } = data;
        
        // Notify caller that call was declined
        io.to(to).emit("call:declined", {
          from: userId,
          conversationId,
        });
        
        console.log(`Call declined by ${userId}`);
      } catch (error) {
        console.error("Error in call:decline:", error);
      }
    });

    /**
     * End an active call
     */
    socket.on("call:end", async (data: any) => {
      try {
        const { conversationId, to } = data;
        
        // Notify other party that call ended
        io.to(to).emit("call:ended", {
          from: userId,
          conversationId,
        });
        
        console.log(`Call ended by ${userId}`);
      } catch (error) {
        console.error("Error in call:end:", error);
      }
    });

    /**
     * User goes offline
     */
    socket.on("disconnect", async () => {
      // user disconnected log removed
      try {
        // Update status in database
        await userService.updateUserStatus(userId, "offline");
        // Broadcast to all clients
        io.emit("user:status", { userId, status: "offline" });
      } catch (error) {
        console.error("Error updating user status to offline:", error);
      }
    });
  });
}
