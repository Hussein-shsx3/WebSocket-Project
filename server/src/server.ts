import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { app } from "./app";
import { config } from "./config/env.config";
import { PrismaClient } from "@prisma/client";

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
 * Socket.IO Events
 */
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Handle user joining a room
  socket.on("join_room", (roomId: string) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user_joined", {
      userId: socket.id,
      message: "A user has joined the room",
    });
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle sending messages
  socket.on("send_message", (data: any) => {
    io.to(data.roomId).emit("receive_message", {
      userId: socket.id,
      message: data.message,
      timestamp: new Date(),
    });
  });

  // Handle user leaving a room
  socket.on("leave_room", (roomId: string) => {
    socket.leave(roomId);
    socket.broadcast.to(roomId).emit("user_left", {
      userId: socket.id,
      message: "A user has left the room",
    });
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

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
