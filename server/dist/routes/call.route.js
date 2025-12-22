"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const call_controller_1 = require("../controllers/call.controller");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, call_controller_1.initiateCall);
router.patch("/status", auth_middleware_1.authenticate, call_controller_1.updateCallStatus);
router.patch("/end", auth_middleware_1.authenticate, call_controller_1.endCall);
router.patch("/decline", auth_middleware_1.authenticate, call_controller_1.declineCall);
router.patch("/miss", auth_middleware_1.authenticate, call_controller_1.missCall);
router.get("/:conversationId/history", auth_middleware_1.authenticate, call_controller_1.getCallHistory);
router.get("/:conversationId", auth_middleware_1.authenticate, call_controller_1.getActiveCall);
exports.default = router;
//# sourceMappingURL=call.route.js.map