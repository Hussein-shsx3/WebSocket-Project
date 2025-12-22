"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.resendVerificationSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.resendVerificationSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(10, "Invalid token"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
//# sourceMappingURL=auth.dto.js.map