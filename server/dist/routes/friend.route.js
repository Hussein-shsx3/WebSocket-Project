"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const friend_controller_1 = require("../controllers/friend.controller");
const router = (0, express_1.Router)();
router.post("/request", auth_middleware_1.authenticate, friend_controller_1.sendFriendRequestHandler);
router.patch("/request/:requestId/accept", auth_middleware_1.authenticate, friend_controller_1.acceptFriendRequestHandler);
router.patch("/request/:requestId/reject", auth_middleware_1.authenticate, friend_controller_1.rejectFriendRequestHandler);
router.delete("/request/:requestId", auth_middleware_1.authenticate, friend_controller_1.cancelFriendRequestHandler);
router.get("/requests", auth_middleware_1.authenticate, friend_controller_1.getFriendRequestsHandler);
router.get("/", auth_middleware_1.authenticate, friend_controller_1.getFriendsHandler);
router.delete("/:friendId", auth_middleware_1.authenticate, friend_controller_1.removeFriendHandler);
exports.default = router;
//# sourceMappingURL=friend.route.js.map