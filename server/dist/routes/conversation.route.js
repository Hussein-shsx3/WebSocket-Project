"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const conversation_controller_1 = require("../controllers/conversation.controller");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, conversation_controller_1.getOrCreateConversation);
router.get("/", auth_middleware_1.authenticate, conversation_controller_1.getUserConversations);
router.patch("/archive", auth_middleware_1.authenticate, conversation_controller_1.archiveConversation);
router.patch("/unarchive", auth_middleware_1.authenticate, conversation_controller_1.unarchiveConversation);
router.delete("/", auth_middleware_1.authenticate, conversation_controller_1.deleteConversation);
router.get("/:conversationId/user", auth_middleware_1.authenticate, conversation_controller_1.getOtherUser);
router.get("/:conversationId", auth_middleware_1.authenticate, conversation_controller_1.getConversation);
exports.default = router;
//# sourceMappingURL=conversation.route.js.map