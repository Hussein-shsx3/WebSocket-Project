"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "5000", 10),
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "30d",
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "52428800", 10),
    UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "10", 10),
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM || "noreply@chatapp.com",
    VERIFICATION_EXPIRY: process.env.VERIFICATION_EXPIRY || "24h",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};
const validateEnv = () => {
    const required = ["DATABASE_URL", "JWT_SECRET"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
    console.log("✅ Environment variables validated");
};
exports.validateEnv = validateEnv;
//# sourceMappingURL=env.config.js.map