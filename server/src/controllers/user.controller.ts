import { Request, Response } from "express";
import { updateProfileSchema, searchUsersSchema } from "../dto/user.dto";
import {
  getUserProfile,
  getUserById,
  updateUserProfile,
  uploadUserAvatar,
  searchUsers,
  deleteUserAccount,
  updateUserStatus,
  getAllUsers,
  getTotalUsersCount,
} from "../services/user.service";
import { asyncHandler } from "../middleware/error.middleware";

/**
 * Get current user's profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const user = await getUserProfile(userId);

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: user,
  });
});

/**
 * Get user by ID (public profile)
 */
export const getUserByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await getUserById(id);

  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  // Validate request body
  const validationResult = updateProfileSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors,
    });
    return;
  }

  const updatedUser = await updateUserProfile(userId, validationResult.data);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

/**
 * Upload user avatar
 */
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }

  const updatedUser = await uploadUserAvatar(userId, req.file);

  res.status(200).json({
    success: true,
    message: "Avatar uploaded successfully",
    data: updatedUser,
  });
});

/**
 * Search users
 */
export const searchUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  // Validate query parameters
  const validationResult = searchUsersSchema.safeParse(req.query);

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

  const users = await searchUsers(query, limitNumber);

  res.status(200).json({
    success: true,
    message: "Users found",
    data: {
      count: users.length,
      users,
    },
  });
});

/**
 * Update user status
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
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

  const updatedUser = await updateUserStatus(userId, status);

  res.status(200).json({
    success: true,
    message: "Status updated successfully",
    data: updatedUser,
  });
});

/**
 * Delete user account
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  await deleteUserAccount(userId);

  // Clear refresh token cookie on account deletion
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

/**
 * Get all users (Admin only)
 */
export const getAllUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * limit;

  const users = await getAllUsers(limit, skip);
  const total = await getTotalUsersCount();

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