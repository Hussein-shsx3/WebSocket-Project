"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const db_1 = __importDefault(require("./db"));
const env_config_1 = require("./env.config");
if (!env_config_1.config.GOOGLE_CLIENT_ID || !env_config_1.config.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️  Google OAuth credentials not configured. Google authentication will not work.");
}
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_config_1.config.GOOGLE_CLIENT_ID || "not-configured",
    clientSecret: env_config_1.config.GOOGLE_CLIENT_SECRET || "not-configured",
    callbackURL: `${env_config_1.config.SERVER_URL}/api/v1/auth/google/callback`,
    passReqToCallback: false,
    scope: ["email", "profile"],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;
        if (!email) {
            return done(new Error("No email provided by Google"));
        }
        let user = await db_1.default.user.findUnique({
            where: { email },
        });
        if (user) {
            if (!user.googleId) {
                user = await db_1.default.user.update({
                    where: { email },
                    data: { googleId },
                });
            }
        }
        else {
            user = await db_1.default.user.create({
                data: {
                    email,
                    name: name || email.split("@")[0],
                    avatar: avatar || null,
                    googleId,
                    emailVerified: true,
                    role: "USER",
                },
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await db_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
            },
        });
        done(null, user);
    }
    catch (error) {
        done(error);
    }
});
exports.default = passport_1.default;
//# sourceMappingURL=google-auth.config.js.map