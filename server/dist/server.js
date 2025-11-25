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
exports.io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user_joined", {
            userId: socket.id,
            message: "A user has joined the room",
        });
        console.log(`User ${socket.id} joined room ${roomId}`);
    });
    socket.on("send_message", (data) => {
        exports.io.to(data.roomId).emit("receive_message", {
            userId: socket.id,
            message: data.message,
            timestamp: new Date(),
        });
    });
    socket.on("leave_room", (roomId) => {
        socket.leave(roomId);
        socket.broadcast.to(roomId).emit("user_left", {
            userId: socket.id,
            message: "A user has left the room",
        });
        console.log(`User ${socket.id} left room ${roomId}`);
    });
    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
    socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");
        return true;
    }
    catch (error) {
        console.warn("⚠️  Database connection failed. Running in offline mode.");
        console.warn("   Make sure PostgreSQL is running at localhost:5432");
        return false;
    }
};
const gracefulShutdown = async () => {
    console.log("\n🛑 Shutting down gracefully...");
    exports.io.close();
    server.close(() => {
        console.log("✅ HTTP server closed");
    });
    await prisma.$disconnect();
    console.log("✅ Database disconnected");
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
            console.log(`🚀 Server running on http://localhost:${env_config_1.config.PORT} in ${env_config_1.config.NODE_ENV} mode`);
            console.log(`📡 WebSocket server initialized with Socket.IO`);
            if (dbConnected) {
                console.log("✅ Database is connected");
            }
            else {
                console.log("⚠️  Running without database (offline mode)");
            }
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map