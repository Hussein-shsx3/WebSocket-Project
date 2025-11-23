import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { config, validateEnv } from "./config/env.config";
import { errorHandler } from "./middleware/error.middleware";
import { AppError } from "./types/error.types";

/**
 * Initialize Express Application
 */
export const app: Express = express();

/**
 * Validate environment variables
 */
validateEnv();

/**
 * Global Middleware
 */
// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: true }));

/**
 * Health Check Route
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Routes (Placeholder)
 */
// Authentication Routes
// app.use("/api/auth", authRoutes);

// User Routes
// app.use("/api/users", userRoutes);

// Chat Routes
// app.use("/api/chats", chatRoutes);

// Message Routes
// app.use("/api/messages", messageRoutes);

/**
 * 404 Handler - Not Found
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `Cannot find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
});

/**
 * Global Error Handler Middleware
 */
app.use(errorHandler);

export default app;
