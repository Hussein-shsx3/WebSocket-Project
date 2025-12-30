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
        // connection log removed
        socket.on("conversation:open", async (conversationId) => {
            try {
                // conversation open log removed
                socket.join(conversationId);
                await message_service_1.messageService.markMessagesAsRead(conversationId, userId);
                socket.to(conversationId).emit("messages:read", {
                    conversationId,
                    userId,
                    readAt: new Date(),
                });
                // auto-mark log removed
            }
            catch (error) {
                console.error("Error in conversation:open:", error);
                socket.emit("error", { message: "Failed to mark messages as read" });
            }
        });
        socket.on("conversation:close", (conversationId) => {
            // conversation close log removed
            socket.leave(conversationId);
        });
        socket.on("message:send", async (data) => {
            try {
                const { conversationId, content, type = "TEXT", mediaUrls = [] } = data;
                // incoming message log removed
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
                // message broadcast log removed
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
        socket.on("message:edit", async (data) => {
            try {
                const { messageId, conversationId, newContent } = data;
                // edit message log removed
                const updatedMessage = await message_service_1.messageService.editMessage(messageId, userId, newContent);
                io.to(conversationId).emit("message:edited", {
                    messageId,
                    conversationId,
                    newContent: updatedMessage.content,
                    isEdited: true,
                    editedAt: updatedMessage.editedAt,
                });
                // message edit broadcast log removed
            }
            catch (error) {
                console.error("Error editing message:", error);
                socket.emit("error", { message: "Failed to edit message" });
            }
        });
        socket.on("message:delete", async (data) => {
            try {
                const { messageId, conversationId } = data;
                // delete message log removed
                await message_service_1.messageService.deleteMessage(messageId, userId);
                io.to(conversationId).emit("message:deleted", {
                    messageId,
                    conversationId,
                });
                // message deletion broadcast log removed
            }
            catch (error) {
                console.error("Error deleting message:", error);
                socket.emit("error", { message: "Failed to delete message" });
            }
        });
        socket.on("typing:start", (conversationId) => {
            // typing start log removed
            socket.to(conversationId).emit("user:typing", {
                conversationId,
                userId,
                isTyping: true,
            });
        });
        socket.on("typing:stop", (conversationId) => {
            // typing stop log removed
            socket.to(conversationId).emit("user:typing", {
                conversationId,
                userId,
                isTyping: false,
            });
        });
        socket.on("message:read", (data) => {
            try {
                const { conversationId, messageIds } = data;
                // read receipt log removed
                socket.to(conversationId).emit("user:read-receipt", {
                    conversationId,
                    userId,
                    messageIds,
                    readAt: new Date(),
                });
                // read receipt broadcast log removed
            }
            catch (error) {
                console.error("Error broadcasting read receipt:", error);
            }
        });
        socket.on("message:react", async (data) => {
            try {
                const { messageId, conversationId, emoji } = data;
                // reaction log removed
                const reaction = await message_service_1.messageService.reactToMessage(messageId, userId, emoji);
                io.to(conversationId).emit("message:reaction", {
                    messageId,
                    conversationId,
                    userId,
                    emoji,
                    removed: reaction.removed || false,
                });
                // reaction broadcast log removed
            }
            catch (error) {
                console.error("Error reacting to message:", error);
                socket.emit("error", { message: "Failed to react to message" });
            }
        });
        socket.on("user:online", () => {
            // user online log removed
            io.emit("user:status", { userId, status: "online" });
        });
        socket.on("disconnect", () => {
            // user disconnected log removed
            io.emit("user:status", { userId, status: "offline" });
        });
    });
}
//# sourceMappingURL=chat.socket.js.map