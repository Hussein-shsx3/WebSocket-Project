"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const env_config_1 = require("./config/env.config");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const google_auth_route_1 = __importDefault(require("./routes/google-auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const friend_route_1 = __importDefault(require("./routes/friend.route"));
const conversation_route_1 = __importDefault(require("./routes/conversation.route"));
const message_route_1 = __importDefault(require("./routes/message.route"));
const call_route_1 = __importDefault(require("./routes/call.route"));
require("./config/google-auth.config");
exports.app = (0, express_1.default)();
(0, env_config_1.validateEnv)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({
    origin: env_config_1.config.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
exports.app.use(express_1.default.json({ limit: "10kb" }));
exports.app.use(express_1.default.urlencoded({ limit: "10kb", extended: true }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use((0, express_session_1.default)({
    secret: env_config_1.config.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env_config_1.config.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
exports.app.use(passport_1.default.initialize());
exports.app.use(passport_1.default.session());
exports.app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});
exports.app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "WebSocket Chat API Server",
        version: "1.0.0",
        health: "OK",
        timestamp: new Date().toISOString(),
    });
});
exports.app.use("/api/v1/auth", auth_route_1.default);
exports.app.use("/api/v1/auth", google_auth_route_1.default);
exports.app.use("/api/v1/users", user_route_1.default);
exports.app.use("/api/v1/friends", friend_route_1.default);
exports.app.use("/api/v1/conversations", conversation_route_1.default);
exports.app.use("/api/v1/messages", message_route_1.default);
exports.app.use("/api/v1/calls", call_route_1.default);
exports.app.use(error_middleware_1.notFound);
exports.app.use(error_middleware_1.errorHandler);
exports.default = exports.app;
//# sourceMappingURL=app.js.map