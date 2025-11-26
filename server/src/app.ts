import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { config, validateEnv } from "./config/env.config";
import { errorHandler } from "./middleware/error.middleware";
import { AppError } from "./types/error.types";
import authRoutes from "./routes/auth.route";
import googleAuthRoutes from "./routes/google-auth.route";
import "./config/google-auth.config"; // Initialize Passport strategies

export const app: Express = express();

validateEnv();

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
// Cookie parser (for refresh token cookie)
app.use(cookieParser());

/**
 * Session Configuration for OAuth
 * 
 * Express-session stores user session data in memory
 * When user logs in via Google, we store their user ID in the session
 * This persists authentication across page reloads during OAuth flow
 * 
 * For production, replace MemoryStore with a database store (Redis, MongoDB, etc)
 */
app.use(
  session({
    secret: config.JWT_SECRET, // Use same secret as JWT for consistency
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until modified
    cookie: {
      secure: config.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // Prevent client-side JS from accessing session cookie
      sameSite: "strict", // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

/**
 * Passport Middleware
 * 
 * These middleware handle:
 * 1. passport.initialize() - Initializes Passport
 * 2. passport.session() - Restores user from session on each request
 */
app.use(passport.initialize());
app.use(passport.session());

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
 * API Routes
 */
// Authentication Routes (traditional email/password)
app.use("/api/v1/auth", authRoutes);

// Google OAuth Routes
app.use("/api/v1/auth", googleAuthRoutes);

// User Routes
// app.use("/api/v1/users", userRoutes);

// Chat Routes
// app.use("/api/v1/chats", chatRoutes);

// Message Routes
// app.use("/api/v1/messages", messageRoutes);

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
