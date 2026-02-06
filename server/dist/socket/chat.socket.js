"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChatSocket = setupChatSocket;
const message_service_1 = require("../services/message.service");
const userService = __importStar(require("../services/user.service"));
function setupChatSocket(io) {
    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        if (!userId) {
            socket.disconnect();
            return;
        }
        socket.join(userId);
        socket.on("conversation:open", async (conversationId) => {
            try {
                socket.join(conversationId);
                await message_service_1.messageService.markMessagesAsRead(conversationId, userId);
                socket.to(conversationId).emit("messages:read", {
                    conversationId,
                    userId,
                    readAt: new Date(),
                });
            }
            catch (error) {
                console.error("Error in conversation:open:", error);
                socket.emit("error", { message: "Failed to mark messages as read" });
            }
        });
        socket.on("conversation:close", (conversationId) => {
            socket.leave(conversationId);
        });
        socket.on("message:send", async (data) => {
            try {
                const { conversationId, content, type = "TEXT", mediaUrls = [] } = data;
                const message = await message_service_1.messageService.sendMessage(conversationId, userId, content, type, mediaUrls);
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
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
        socket.on("message:edit", async (data) => {
            try {
                const { messageId, conversationId, newContent } = data;
                const updatedMessage = await message_service_1.messageService.editMessage(messageId, userId, newContent);
                io.to(conversationId).emit("message:edited", {
                    messageId,
                    conversationId,
                    newContent: updatedMessage.content,
                    isEdited: true,
                    editedAt: updatedMessage.editedAt,
                });
            }
            catch (error) {
                console.error("Error editing message:", error);
                socket.emit("error", { message: "Failed to edit message" });
            }
        });
        socket.on("message:delete", async (data) => {
            try {
                const { messageId, conversationId } = data;
                await message_service_1.messageService.deleteMessage(messageId, userId);
                io.to(conversationId).emit("message:deleted", {
                    messageId,
                    conversationId,
                });
            }
            catch (error) {
                console.error("Error deleting message:", error);
                socket.emit("error", { message: "Failed to delete message" });
            }
        });
        socket.on("typing:start", (conversationId) => {
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
        socket.on("message:read", (data) => {
            try {
                const { conversationId, messageIds } = data;
                socket.to(conversationId).emit("user:read-receipt", {
                    conversationId,
                    userId,
                    messageIds,
                    readAt: new Date(),
                });
            }
            catch (error) {
                console.error("Error broadcasting read receipt:", error);
            }
        });
        socket.on("message:react", async (data) => {
            try {
                const { messageId, conversationId, emoji } = data;
                const reaction = await message_service_1.messageService.reactToMessage(messageId, userId, emoji);
                io.to(conversationId).emit("message:reaction", {
                    messageId,
                    conversationId,
                    userId,
                    emoji,
                    removed: reaction.removed || false,
                });
            }
            catch (error) {
                console.error("Error reacting to message:", error);
                socket.emit("error", { message: "Failed to react to message" });
            }
        });
        socket.on("user:online", async () => {
            try {
                await userService.updateUserStatus(userId, "online");
                io.emit("user:status", { userId, status: "online" });
            }
            catch (error) {
                console.error("Error updating user status to online:", error);
            }
        });
        socket.on("call:offer", async (data) => {
            try {
                const { conversationId, offer, to, callType } = data;
                const caller = await userService.getUserById(userId);
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
            }
            catch (error) {
                console.error("Error in call:offer:", error);
                socket.emit("error", { message: "Failed to initiate call" });
            }
        });
        socket.on("call:answer", async (data) => {
            try {
                const { conversationId, answer, to } = data;
                console.log(`📞 Call answer received from ${userId}, sending to ${to}`);
                console.log(`📞 Rooms that ${to} should be in:`, io.sockets.adapter.rooms.get(to));
                io.to(to).emit("call:answer", {
                    from: userId,
                    answer,
                    conversationId,
                });
                console.log(`📞 Call answer emitted to room: ${to}`);
            }
            catch (error) {
                console.error("Error in call:answer:", error);
                socket.emit("error", { message: "Failed to answer call" });
            }
        });
        socket.on("call:ice-candidate", async (data) => {
            try {
                const { conversationId, candidate, to } = data;
                io.to(to).emit("call:ice-candidate", {
                    from: userId,
                    candidate,
                    conversationId,
                });
            }
            catch (error) {
                console.error("Error in call:ice-candidate:", error);
            }
        });
        socket.on("call:decline", async (data) => {
            try {
                const { conversationId, to } = data;
                io.to(to).emit("call:declined", {
                    from: userId,
                    conversationId,
                });
                console.log(`Call declined by ${userId}`);
            }
            catch (error) {
                console.error("Error in call:decline:", error);
            }
        });
        socket.on("call:end", async (data) => {
            try {
                const { conversationId, to } = data;
                io.to(to).emit("call:ended", {
                    from: userId,
                    conversationId,
                });
                console.log(`Call ended by ${userId}`);
            }
            catch (error) {
                console.error("Error in call:end:", error);
            }
        });
        socket.on("disconnect", async () => {
            try {
                await userService.updateUserStatus(userId, "offline");
                io.emit("user:status", { userId, status: "offline" });
            }
            catch (error) {
                console.error("Error updating user status to offline:", error);
            }
        });
    });
}
//# sourceMappingURL=chat.socket.js.map