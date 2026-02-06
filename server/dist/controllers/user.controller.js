"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersHandler = exports.deleteAccount = exports.updateStatus = exports.searchUsersHandler = exports.uploadAvatar = exports.updateProfile = exports.getUserByIdHandler = exports.getProfile = void 0;
const user_dto_1 = require("../dto/user.dto");
const user_service_1 = require("../services/user.service");
const error_middleware_1 = require("../middleware/error.middleware");
exports.getProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const user = await (0, user_service_1.getUserProfile)(userId);
    res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
    });
});
exports.getUserByIdHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const user = await (0, user_service_1.getUserById)(id);
    res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
    });
});
exports.updateProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const validationResult = user_dto_1.updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors,
        });
        return;
    }
    const updatedUser = await (0, user_service_1.updateUserProfile)(userId, validationResult.data);
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
    });
});
exports.uploadAvatar = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
    }
    const updatedUser = await (0, user_service_1.uploadUserAvatar)(userId, req.file);
    res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        data: updatedUser,
    });
});
exports.searchUsersHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const validationResult = user_dto_1.searchUsersSchema.safeParse(req.query);
    if (!validationResult.success) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors,
        });
        return;
    }
    const { query, limit } = validationResult.data;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const users = await (0, user_service_1.searchUsers)(query, limitNumber, userId);
    res.status(200).json({
        success: true,
        message: "Users found",
        data: {
            count: users.length,
            users,
        },
    });
});
exports.updateStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const { status } = req.body;
    if (!status) {
        res.status(400).json({ success: false, message: "Status is required" });
        return;
    }
    const updatedUser = await (0, user_service_1.updateUserStatus)(userId, status);
    res.status(200).json({
        success: true,
        message: "Status updated successfully",
        data: updatedUser,
    });
});
exports.deleteAccount = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    await (0, user_service_1.deleteUserAccount)(userId);
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
    res.status(200).json({
        success: true,
        message: "Account deleted successfully",
    });
});
exports.getAllUsersHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const users = await (0, user_service_1.getAllUsers)(limit, skip);
    const total = await (0, user_service_1.getTotalUsersCount)();
    res.status(200).json({
        success: true,
        message: "All users retrieved successfully",
        data: {
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        },
    });
});
//# sourceMappingURL=user.controller.js.map