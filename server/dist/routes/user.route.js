"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_1.authenticate, user_controller_1.getProfile);
router.patch("/profile", auth_middleware_1.authenticate, user_controller_1.updateProfile);
router.post("/avatar", auth_middleware_1.authenticate, upload_middleware_1.upload.single("avatar"), user_controller_1.uploadAvatar);
router.patch("/status", auth_middleware_1.authenticate, user_controller_1.updateStatus);
router.delete("/profile", auth_middleware_1.authenticate, user_controller_1.deleteAccount);
router.get("/search", auth_middleware_1.authenticate, user_controller_1.searchUsersHandler);
router.get("/admin/all", auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)("ADMIN"), user_controller_1.getAllUsersHandler);
router.get("/:id", auth_middleware_1.authenticate, user_controller_1.getUserByIdHandler);
exports.default = router;
//# sourceMappingURL=user.route.js.map