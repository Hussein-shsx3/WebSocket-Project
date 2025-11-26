"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const google_auth_controller_1 = require("../controllers/google-auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["email", "profile"],
    accessType: "offline",
    prompt: "consent",
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: "/api/v1/auth/error",
    session: true,
}), google_auth_controller_1.googleCallback);
router.post("/google/logout", auth_middleware_1.authenticate, google_auth_controller_1.googleLogout);
exports.default = router;
//# sourceMappingURL=google-auth.route.js.map