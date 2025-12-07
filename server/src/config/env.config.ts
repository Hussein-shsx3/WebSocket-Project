import dotenv from "dotenv";

dotenv.config();

/**
 * Environment Configuration
 */
export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  SERVER_URL: process.env.SERVER_URL || "http://localhost:5000",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "30d",

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "52428800", 10), // 50MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",

  // Bcrypt
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "10", 10),

  // Email Service
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@chatapp.com",
  VERIFICATION_EXPIRY: process.env.VERIFICATION_EXPIRY || "24h",

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  // Add to existing config
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
};

/**
 * Validate required environment variables
 */
export const validateEnv = () => {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  console.log("✅ Environment variables validated");
};
