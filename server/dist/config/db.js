"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDBHealth = exports.disconnectDB = exports.connectDB = void 0;
const client_1 = require("@prisma/client");
const prisma = global.prisma ||
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });
if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log("✅ Database disconnected successfully");
    }
    catch (error) {
        console.error("❌ Database disconnection failed:", error);
    }
};
exports.disconnectDB = disconnectDB;
const checkDBHealth = async () => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error("❌ Database health check failed:", error);
        return false;
    }
};
exports.checkDBHealth = checkDBHealth;
exports.default = prisma;
//# sourceMappingURL=db.js.map