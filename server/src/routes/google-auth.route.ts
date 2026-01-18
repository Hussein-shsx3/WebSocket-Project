import { Router } from "express";
import passport from "passport";
import {
  googleCallback,
} from "../controllers/google-auth.controller";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    accessType: "offline",
    prompt: "consent",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/v1/auth/error",
    session: true,
  }),
  googleCallback
);

export default router;
