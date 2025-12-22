import { PrismaClient } from "@prisma/client";

// Extend NodeJS global type
declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma Client instance
const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/**
 * Connect to database
 */
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

/**
 * Disconnect from database
 */
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
  }
};

/**
 * Health check for database
 */
export const checkDBHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return false;
  }
};

export default prisma;
