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
const env_config_1 = require("./config/env.config");
const error_middleware_1 = require("./middleware/error.middleware");
const error_types_1 = require("./types/error.types");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
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
exports.app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});
exports.app.use("/api/v1/auth", auth_route_1.default);
exports.app.use((req, res, next) => {
    const error = new error_types_1.AppError(`Cannot find ${req.originalUrl} on this server!`, 404);
    next(error);
});
exports.app.use(error_middleware_1.errorHandler);
exports.default = exports.app;
//# sourceMappingURL=app.js.map