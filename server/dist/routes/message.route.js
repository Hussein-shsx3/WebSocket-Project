"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const message_controller_1 = require("../controllers/message.controller");
const router = (0, express_1.Router)();
router.post("/mark-as-read", auth_middleware_1.authenticate, message_controller_1.markAsRead);
router.get("/search", auth_middleware_1.authenticate, message_controller_1.searchMessages);
router.post("/react", auth_middleware_1.authenticate, message_controller_1.reactToMessage);
router.delete("/react", auth_middleware_1.authenticate, message_controller_1.removeReaction);
router.patch("/edit", auth_middleware_1.authenticate, message_controller_1.editMessage);
router.get("/:messageId/reactions", auth_middleware_1.authenticate, message_controller_1.getReactions);
router.get("/:messageId/read-receipts", auth_middleware_1.authenticate, message_controller_1.getReadReceipts);
router.post("/", auth_middleware_1.authenticate, message_controller_1.sendMessage);
router.delete("/", auth_middleware_1.authenticate, message_controller_1.deleteMessage);
router.get("/:conversationId", auth_middleware_1.authenticate, message_controller_1.getMessages);
exports.default = router;
//# sourceMappingURL=message.route.js.map