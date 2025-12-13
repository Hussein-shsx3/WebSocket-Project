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
                    createdAt: message.createdAt,
                    sender: {
                        id: userId,
                        name: message.sender?.name,
                        avatar: message.sender?.avatar,
                    },
                });
                const room = io.sockets.adapter.rooms.get(conversationId);
                if (room) {
                    for (const socketId of room) {
                        const recipientSocket = io.sockets.sockets.get(socketId);
                        if (recipientSocket && recipientSocket.data.userId !== userId) {
                            await message_service_1.messageService.markMessagesAsRead(conversationId, recipientSocket.data.userId);
                            console.log(`✅ Auto-marked message as read for ${recipientSocket.data.userId}`);
                        }
                    }
                }
                console.log(`📤 Message broadcasted to ${conversationId}`);
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
        socket.on("message:received", async (data) => {
            try {
                const { conversationId, messageId } = data;
                if (socket.rooms.has(conversationId)) {
                    await message_service_1.messageService.markMessagesAsRead(conversationId, userId);
                    socket.to(conversationId).emit("message:read", {
                        conversationId,
                        messageId,
                        userId,
                        readAt: new Date(),
                    });
                    console.log(`✅ Auto-marked message as read for ${userId}`);
                }
                else {
                    console.log(`🔵 Message left unread - ${userId} not in room`);
                }
            }
            catch (error) {
                console.error("Error marking message as read:", error);
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
            socket.to(conversationId).emit("user:typing", {
                conversationId,
                userId,
                isTyping: false,
            });
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