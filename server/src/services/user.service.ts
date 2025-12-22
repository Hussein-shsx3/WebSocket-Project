import prisma from "../config/db";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../utils/cloudinary.util";
import { UpdateProfileDTO } from "../dto/user.dto";

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
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

/**
 * Get user by ID (public profile)
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
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

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, data: UpdateProfileDTO) => {
  const user = await prisma.user.update({
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

/**
 * Upload user avatar to Cloudinary
 */
export const uploadUserAvatar = async (userId: string, file: Express.Multer.File) => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Get current user to delete old avatar if exists
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  // Delete old avatar from Cloudinary if exists
  if (currentUser?.avatar) {
    try {
      const publicId = getPublicIdFromUrl(currentUser.avatar);
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error("Error deleting old avatar:", error);
    }
  }

  // Upload new avatar
  const uploadResult = await uploadToCloudinary(file, "chat-app/avatars");

  // Update user with new avatar URL
  const updatedUser = await prisma.user.update({
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

/**
 * Search users by name or email
 */
export const searchUsers = async (query: string, limit: number = 10) => {
  const users = await prisma.user.findMany({
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

/**
 * Delete user account
 */
export const deleteUserAccount = async (userId: string) => {
  // Delete old avatar if exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  if (user?.avatar) {
    try {
      const publicId = getPublicIdFromUrl(user.avatar);
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error("Error deleting avatar:", error);
    }
  }

  // Delete user (cascade delete will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "Account deleted successfully" };
};

/**
 * Update user status (online, offline, away)
 */
export const updateUserStatus = async (userId: string, status: string) => {
  const validStatuses = ["online", "offline", "away"];

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status. Must be one of: online, offline, away");
  }

  const user = await prisma.user.update({
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

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (limit: number = 10, skip: number = 0) => {
  const users = await prisma.user.findMany({
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

/**
 * Get total users count
 */
export const getTotalUsersCount = async () => {
  return prisma.user.count();
};


