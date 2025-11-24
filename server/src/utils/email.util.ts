import nodemailer, { Transporter } from "nodemailer";
import { config } from "../config/env.config";

/**
 * Email Transporter Configuration
 */
let transporter: Transporter;

/**
 * Initialize Email Transporter
 */
export const initializeEmailService = (): void => {
  try {
    transporter = nodemailer.createTransport({
      service: config.EMAIL_SERVICE,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD,
      },
    });

    console.log("✅ Email service initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize email service:", error);
    throw new Error("Email service initialization failed");
  }
};

/**
 * Email Options Interface
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send Email
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!transporter) {
      initializeEmailService();
    }

    const mailOptions = {
      from: config.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || "",
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Send Verification Email
 */
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
  verificationLink: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </p>
      <p>Or copy this link in your browser:</p>
      <p>${verificationLink}</p>
      <p style="font-size: 12px; color: #666;">This link will expire in 24 hours.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Email Verification",
    html,
  });
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  resetLink: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p>
        <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>Or copy this link in your browser:</p>
      <p>${resetLink}</p>
      <p style="font-size: 12px; color: #666;">This link will expire in 1 hour.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html,
  });
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining us. Your email has been verified and your account is now active.</p>
      <p>You can now log in to your account and start using our services.</p>
      <p>If you have any questions, feel free to contact us.</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Welcome to our platform",
    html,
  });
};
