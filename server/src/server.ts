import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { app } from "./app";
import { config } from "./config/env.config";
import { PrismaClient } from "@prisma/client";
import { setupChatSocket } from "./socket/chat.socket";
import { verifyAccessToken } from "./utils/jwt.util";

/**
 * Initialize Prisma Client
 */
const prisma = new PrismaClient();

/**
 * Create HTTP Server
 */
const server = http.createServer(app);

/**
 * Initialize Socket.IO
 */
export const io = new SocketIOServer(server, {
  cors: {
    origin: config.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/**
 * Socket.IO Middleware - Extract userId from JWT token
 */
io.use((socket, next) => {
  try {
    // Get token from auth header or auth.token
    let token = socket.handshake.auth.token;
    
    if (!token && socket.handshake.headers.authorization) {
      // Extract token from "Bearer <token>" format
      const authHeader = socket.handshake.headers.authorization;
      token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    }

    if (!token) {
      return next(new Error("No token provided"));
    }

    // Verify and decode token
    const decoded = verifyAccessToken(token);
    
    if (!decoded.userId) {
      return next(new Error("userId not found in token"));
    }

    // Add userId to socket.data for later use
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    socket.data.role = decoded.role;

    next();
  } catch (error: any) {
    console.error("❌ Socket.IO Auth Error:", error.message);
    return next(new Error(`Authentication failed: ${error.message}`));
  }
});

/**
 * Initialize Chat Socket Handlers
 */
setupChatSocket(io);

/**
 * Database Connection
 */
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.warn("⚠️  Database connection failed. Running in offline mode.");
    console.warn("   Make sure PostgreSQL is running at localhost:5432");
    return false;
  }
};

/**
 * Graceful Shutdown
 */
const gracefulShutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");

  // Close Socket.IO connections
  io.close();

  // Close HTTP server
  server.close(() => {
    console.log("✅ HTTP server closed");
  });

  // Disconnect Prisma
  await prisma.$disconnect();
  console.log("✅ Database disconnected");

  process.exit(0);
};

/**
 * Shutdown Signals
 */
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

/**
 * Unhandled Promise Rejection
 */
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Attempt to connect to database (optional)
    const dbConnected = await connectDatabase();

    // Start listening
    server.listen(config.PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${config.PORT} in ${config.NODE_ENV} mode`
      );
      console.log(`📡 WebSocket server initialized with Socket.IO`);
      if (dbConnected) {
        console.log("✅ Database is connected");
      } else {
        console.log("⚠️  Running without database (offline mode)");
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

export { server, prisma };
