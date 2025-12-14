"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChatSocket = setupChatSocket;
const message_service_1 = require("../services/message.service");
function setupChatSocket(io) {
    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        if (!userId) {
            socket.disconnect();
            return;
        }
        console.log(`✅ User ${userId} connected - Socket: ${socket.id}`);
        socket.on("conversation:open", async (conversationId) => {
            try {
                console.log(`📖 ${userId} opened conversation ${conversationId}`);
                socket.join(conversationId);
                await message_service_1.messageService.markMessagesAsRead(conversationId, userId);
                socket.to(conversationId).emit("messages:read", {
                    conversationId,
                    userId,
                    readAt: new Date(),
                });
                console.log(`✅ Auto-marked messages as read for ${userId}`);
            }
            catch (error) {
                console.error("Error in conversation:open:", error);
                socket.emit("error", { message: "Failed to mark messages as read" });
            }
        });
        socket.on("conversation:close", (conversationId) => {
            console.log(`👋 ${userId} closed conversation ${conversationId}`);
            socket.leave(conversationId);
        });
        socket.on("message:send", async (data) => {
            try {
                const { conversationId, content, type = "TEXT", mediaUrls = [] } = data;
                console.log(`📨 Message from ${userId} in ${conversationId}`);
                const message = await message_service_1.messageService.sendMessage(conversationId, userId, content, type, mediaUrls);
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
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
        socket.on("message:edit", async (data) => {
            try {
                const { messageId, conversationId, newContent } = data;
                console.log(`✏️ User ${userId} editing message ${messageId}`);
                const updatedMessage = await message_service_1.messageService.editMessage(messageId, userId, newContent);
                io.to(conversationId).emit("message:edited", {
                    messageId,
                    conversationId,
                    newContent: updatedMessage.content,
                    isEdited: true,
                    editedAt: updatedMessage.editedAt,
                });
                console.log(`✅ Message edit broadcasted to ${conversationId}`);
            }
            catch (error) {
                console.error("Error editing message:", error);
                socket.emit("error", { message: "Failed to edit message" });
            }
        });
        socket.on("message:delete", async (data) => {
            try {
                const { messageId, conversationId } = data;
                console.log(`🗑️ User ${userId} deleting message ${messageId}`);
                await message_service_1.messageService.deleteMessage(messageId, userId);
                io.to(conversationId).emit("message:deleted", {
                    messageId,
                    conversationId,
                });
                console.log(`✅ Message deletion broadcasted to ${conversationId}`);
            }
            catch (error) {
                console.error("Error deleting message:", error);
                socket.emit("error", { message: "Failed to delete message" });
            }
        });
        socket.on("typing:start", (conversationId) => {
            console.log(`⌨️ ${userId} is typing in ${conversationId}`);
            socket.to(conversationId).emit("user:typing", {
                conversationId,
                userId,
                isTyping: true,
            });
        });
        socket.on("typing:stop", (conversationId) => {
            console.log(`⌨️ ${userId} stopped typing in ${conversationId}`);
            socket.to(conversationId).emit("user:typing", {
                conversationId,
                userId,
                isTyping: false,
            });
        });
        socket.on("message:read", (data) => {
            try {
                const { conversationId, messageIds } = data;
                console.log(`👁️ ${userId} read messages in ${conversationId}`);
                socket.to(conversationId).emit("user:read-receipt", {
                    conversationId,
                    userId,
                    messageIds,
                    readAt: new Date(),
                });
                console.log(`✅ Read receipt broadcasted to ${conversationId}`);
            }
            catch (error) {
                console.error("Error broadcasting read receipt:", error);
            }
        });
        socket.on("message:react", async (data) => {
            try {
                const { messageId, conversationId, emoji } = data;
                console.log(`😊 ${userId} reacted with ${emoji} to message ${messageId}`);
                const reaction = await message_service_1.messageService.reactToMessage(messageId, userId, emoji);
                io.to(conversationId).emit("message:reaction", {
                    messageId,
                    conversationId,
                    userId,
                    emoji,
                    removed: reaction.removed || false,
                });
                console.log(`✅ Reaction broadcasted to ${conversationId}`);
            }
            catch (error) {
                console.error("Error reacting to message:", error);
                socket.emit("error", { message: "Failed to react to message" });
            }
        });
        socket.on("user:online", () => {
            console.log(`🟢 ${userId} is online`);
            io.emit("user:status", { userId, status: "online" });
        });
        socket.on("disconnect", () => {
            console.log(`🔴 ${userId} disconnected`);
            io.emit("user:status", { userId, status: "offline" });
        });
    });
}
//# sourceMappingURL=chat.socket.js.map