"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.server = exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const env_config_1 = require("./config/env.config");
const client_1 = require("@prisma/client");
const chat_socket_1 = require("./socket/chat.socket");
const jwt_util_1 = require("./utils/jwt.util");
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
const server = http_1.default.createServer(app_1.app);
exports.server = server;
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: env_config_1.config.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
exports.io.use((socket, next) => {
    try {
        let token = socket.handshake.auth.token;
        if (!token && socket.handshake.headers.authorization) {
            const authHeader = socket.handshake.headers.authorization;
            token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : authHeader;
        }
        if (!token) {
            return next(new Error("No token provided"));
        }
        const decoded = (0, jwt_util_1.verifyAccessToken)(token);
        if (!decoded.userId) {
            return next(new Error("userId not found in token"));
        }
        socket.data.userId = decoded.userId;
        socket.data.email = decoded.email;
        socket.data.role = decoded.role;
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Socket.IO Auth Error:", errorMessage);
        return next(new Error(`Authentication failed: ${errorMessage}`));
    }
});
(0, chat_socket_1.setupChatSocket)(exports.io);
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        return true;
    }
    catch (error) {
        console.warn("⚠️  Database connection failed. Running in offline mode.");
        console.warn("   Make sure PostgreSQL is running at localhost:5432");
        return false;
    }
};
const gracefulShutdown = async () => {
    exports.io.close();
    server.close(() => {
    });
    await prisma.$disconnect();
    process.exit(0);
};
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});
const startServer = async () => {
    try {
        const dbConnected = await connectDatabase();
        server.listen(env_config_1.config.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${env_config_1.config.PORT}`);
            console.log(`✅ WebSocket server initialized with CORS origin: ${env_config_1.config.CLIENT_URL}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map