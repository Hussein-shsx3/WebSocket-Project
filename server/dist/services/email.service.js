"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailService = exports.sendWelcomeEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendEmail = exports.initializeEmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_config_1 = require("../config/env.config");
let transporter;
const initializeEmailService = () => {
    try {
        transporter = nodemailer_1.default.createTransport({
            service: env_config_1.config.EMAIL_SERVICE,
            auth: {
                user: env_config_1.config.EMAIL_USER,
                pass: env_config_1.config.EMAIL_PASSWORD,
            },
        });
        // email service initialized (log removed)
    }
    catch (error) {
        console.error("❌ Failed to initialize email service:", error);
        throw new Error("Email service initialization failed");
    }
};
exports.initializeEmailService = initializeEmailService;
const sendEmail = async (options) => {
    try {
        if (!transporter) {
            (0, exports.initializeEmailService)();
        }
        const mailOptions = {
            from: env_config_1.config.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html,
        };
        const info = await transporter.sendMail(mailOptions);
        // email sent (log removed)
    }
    catch (error) {
        console.error("❌ Failed to send email:", error);
        throw new Error("Failed to send email");
    }
};
exports.sendEmail = sendEmail;
const sendVerificationEmail = async (email, verificationToken, verificationUrl) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
      <p style="margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p style="color: #999; font-size: 12px;">This verification link will expire in ${env_config_1.config.VERIFICATION_EXPIRY}.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
    </div>
  `;
    await (0, exports.sendEmail)({
        to: email,
        subject: "Verify Your Email Address",
        html,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      <p style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p style="color: #999; font-size: 12px;">This reset link will expire in 1 hour.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
  `;
    await (0, exports.sendEmail)({
        to: email,
        subject: "Reset Your Password",
        html,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendWelcomeEmail = async (email, name) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Chat App!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining our community! We're excited to have you on board.</p>
      <p>You can now:</p>
      <ul style="color: #666;">
        <li>Connect with friends and colleagues</li>
        <li>Send and receive messages in real-time</li>
        <li>Create and manage your profile</li>
      </ul>
      <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">© 2025 Chat App. All rights reserved.</p>
    </div>
  `;
    await (0, exports.sendEmail)({
        to: email,
        subject: "Welcome to Chat App!",
        html,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const verifyEmailService = async () => {
    try {
        if (!transporter) {
            (0, exports.initializeEmailService)();
        }
        await transporter.verify();
        // email service verified (log removed)
        return true;
    }
    catch (error) {
        console.error("❌ Email service verification failed:", error);
        return false;
    }
};
exports.verifyEmailService = verifyEmailService;
//# sourceMappingURL=email.service.js.map