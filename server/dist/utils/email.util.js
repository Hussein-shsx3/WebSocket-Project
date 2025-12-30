"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendEmail = exports.initializeEmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_config_1 = require("../config/env.config");
const email_templates_1 = require("./templates/email.templates");
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
            text: options.text || "",
        };
        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("❌ Failed to send email:", error);
        throw new Error("Failed to send email");
    }
};
exports.sendEmail = sendEmail;
const sendVerificationEmail = async (email, verificationToken, verificationLink, name) => {
    const html = email_templates_1.emailTemplates.verificationEmail(name || email.split("@")[0], verificationLink);
    await (0, exports.sendEmail)({
        to: email,
        subject: "Verify Your Email Address",
        html,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, resetToken, resetLink, name) => {
    const html = email_templates_1.emailTemplates.passwordResetEmail(name || email.split("@")[0], resetLink);
    await (0, exports.sendEmail)({
        to: email,
        subject: "Password Reset Request",
        html,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendWelcomeEmail = async (email, name) => {
    const html = email_templates_1.emailTemplates.welcomeEmail(name);
    await (0, exports.sendEmail)({
        to: email,
        subject: "Welcome to our platform",
        html,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
//# sourceMappingURL=email.util.js.map