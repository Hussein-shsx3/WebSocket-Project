import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import {
  getProfile,
  getUserByIdHandler,
  updateProfile,
  uploadAvatar,
  searchUsersHandler,
  updateStatus,
  deleteAccount,
  getAllUsersHandler,
} from "../controllers/user.controller";

const router = Router();

/**
 * User Routes
 * IMPORTANT: Static/specific routes MUST come BEFORE dynamic routes (:id)
 */

/**
 * GET /api/v1/users/profile
 * Get current user's profile
 * Requires: Authentication
 */
router.get("/profile", authenticate, getProfile);

/**
 * PATCH /api/v1/users/profile
 * Update current user's profile (name, bio, status)
 * Requires: Authentication
 */
router.patch("/profile", authenticate, updateProfile);

/**
 * POST /api/v1/users/avatar
 * Upload user avatar
 * Requires: Authentication
 * Body: FormData with "avatar" file field
 */
router.post("/avatar", authenticate, upload.single("avatar"), uploadAvatar);

/**
 * PATCH /api/v1/users/status
 * Update user online status
 * Requires: Authentication
 * Body: { status: "online" | "offline" | "away" }
 */
router.patch("/status", authenticate, updateStatus);

/**
 * DELETE /api/v1/users/profile
 * Delete user account
 * Requires: Authentication
 */
router.delete("/profile", authenticate, deleteAccount);

/**
 * GET /api/v1/users/search
 * Search users by name or email
 * Query: ?query=searchTerm&limit=10
 */
router.get("/search", authenticate, searchUsersHandler);

/**
 * GET /api/v1/users/admin/all
 * Get all users (Admin only)
 * Query: ?page=1&limit=10
 * Requires: Authentication + ADMIN role
 * MUST come BEFORE /:id route
 */
router.get("/admin/all", authenticate, authorize("ADMIN"), getAllUsersHandler);

/**
 * GET /api/v1/users/:id
 * Get public user profile by ID
 * MUST come LAST (after all static routes)
 */
router.get("/:id", authenticate, getUserByIdHandler);

export default router;
