"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalUsersCount = exports.getAllUsers = exports.updateUserStatus = exports.deleteUserAccount = exports.searchUsers = exports.uploadUserAvatar = exports.updateUserProfile = exports.getUserById = exports.getUserProfile = void 0;
const db_1 = __importDefault(require("../config/db"));
const cloudinary_util_1 = require("../utils/cloudinary.util");
const getUserProfile = async (userId) => {
    const user = await db_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            bio: true,
            status: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
exports.getUserProfile = getUserProfile;
const getUserById = async (userId) => {
    const user = await db_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            status: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
exports.getUserById = getUserById;
const updateUserProfile = async (userId, data) => {
    const user = await db_1.default.user.update({
        where: { id: userId },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(data.status && { status: data.status }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            bio: true,
            status: true,
            role: true,
            updatedAt: true,
        },
    });
    return user;
};
exports.updateUserProfile = updateUserProfile;
const uploadUserAvatar = async (userId, file) => {
    if (!file) {
        throw new Error("No file provided");
    }
    const currentUser = await db_1.default.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
    });
    if (currentUser?.avatar) {
        try {
            const publicId = (0, cloudinary_util_1.getPublicIdFromUrl)(currentUser.avatar);
            await (0, cloudinary_util_1.deleteFromCloudinary)(publicId);
        }
        catch (error) {
            console.error("Error deleting old avatar:", error);
        }
    }
    const uploadResult = await (0, cloudinary_util_1.uploadToCloudinary)(file, "chat-app/avatars");
    const updatedUser = await db_1.default.user.update({
        where: { id: userId },
        data: { avatar: uploadResult.secure_url },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            bio: true,
            status: true,
            updatedAt: true,
        },
    });
    return updatedUser;
};
exports.uploadUserAvatar = uploadUserAvatar;
const searchUsers = async (query, limit = 10) => {
    const users = await db_1.default.user.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
            ],
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            status: true,
        },
        take: limit,
    });
    return users;
};
exports.searchUsers = searchUsers;
const deleteUserAccount = async (userId) => {
    const user = await db_1.default.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
    });
    if (user?.avatar) {
        try {
            const publicId = (0, cloudinary_util_1.getPublicIdFromUrl)(user.avatar);
            await (0, cloudinary_util_1.deleteFromCloudinary)(publicId);
        }
        catch (error) {
            console.error("Error deleting avatar:", error);
        }
    }
    await db_1.default.user.delete({
        where: { id: userId },
    });
    return { message: "Account deleted successfully" };
};
exports.deleteUserAccount = deleteUserAccount;
const updateUserStatus = async (userId, status) => {
    const validStatuses = ["online", "offline", "away"];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status. Must be one of: online, offline, away");
    }
    const user = await db_1.default.user.update({
        where: { id: userId },
        data: { status },
        select: {
            id: true,
            status: true,
            updatedAt: true,
        },
    });
    return user;
};
exports.updateUserStatus = updateUserStatus;
const getAllUsers = async (limit = 10, skip = 0) => {
    const users = await db_1.default.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            role: true,
            status: true,
            createdAt: true,
        },
        take: limit,
        skip: skip,
        orderBy: { createdAt: "desc" },
    });
    return users;
};
exports.getAllUsers = getAllUsers;
const getTotalUsersCount = async () => {
    return db_1.default.user.count();
};
exports.getTotalUsersCount = getTotalUsersCount;
//# sourceMappingURL=user.service.js.map