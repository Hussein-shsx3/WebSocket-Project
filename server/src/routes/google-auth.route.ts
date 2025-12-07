import { Router } from "express";
import passport from "passport";
import {
  googleCallback,
  googleAuth,
} from "../controllers/google-auth.controller";

const router = Router();

/**
 * Google OAuth Routes
 * 
 * These routes handle the complete Google OAuth 2.0 flow
 */

/**
 * Step 1: Initiate Google OAuth Login
 * 
 * Client flow:
 * 1. User clicks "Sign in with Google" button on frontend
 * 2. Frontend redirects user to this endpoint: GET /api/v1/auth/google
 * 3. Passport middleware intercepts and redirects to Google login page
 * 
 * What happens:
 * - User sees Google login screen
 * - User logs in with their Google account
 * - Google asks for permissions (email, profile)
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    accessType: "offline",
    prompt: "consent",
  })
);

/**
 * Step 2: Google OAuth Callback
 * 
 * This URL is registered in Google Cloud Console as the callback URL
 * Google redirects here after successful authentication
 * 
 * URL: GET /api/v1/auth/google/callback?code=<authorization_code>
 * 
 * What happens:
 * 1. Passport intercepts the request and exchanges the code for user profile
 * 2. googleStrategy verifies the code and calls verifyCallback with user profile
 * 3. verifyCallback finds or creates user in database
 * 4. Passport calls serializeUser() to store user.id in session
 * 5. googleCallback handler generates JWT tokens
 * 6. User is redirected to frontend with access token in URL
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/v1/auth/error",
    session: true,
  }),
  googleCallback
);

export default router;
