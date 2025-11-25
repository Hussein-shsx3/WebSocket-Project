"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = void 0;
exports.emailTemplates = {
    verificationEmail: (name, verificationLink) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica',
            'Arial', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #f9f9f9;
          padding: 40px 20px;
          text-align: center;
          border-bottom: 1px solid #e0e0e0;
        }
        .header h1 {
          font-size: 28px;
          color: #333333;
          font-weight: 600;
        }
        .content {
          padding: 40px 20px;
        }
        .content p {
          color: #666666;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .content strong {
          color: #333333;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 40px;
          background-color: #333333;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background-color: #1a1a1a;
        }
        .link-section {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 6px;
          margin-top: 20px;
          border-left: 4px solid #333333;
        }
        .link-section p {
          margin-bottom: 10px;
          font-size: 14px;
        }
        .link-section a {
          color: #333333;
          word-break: break-all;
          text-decoration: none;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #999999;
        }
        .footer p {
          margin-bottom: 8px;
        }
        .expiry-warning {
          color: #d9534f;
          font-size: 12px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for registering! To complete your account setup, please verify your email address by clicking the button below.</p>
          
          <div class="button-container">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <div class="link-section">
            <a href="${verificationLink}">${verificationLink}</a>
            <p class="expiry-warning">This link will expire in 24 hours.</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #999999;">
            If you didn't create this account, please ignore this email or contact support.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Your Application. All rights reserved.</p>
          <p>Need help? Contact our support team</p>
        </div>
      </div>
    </body>
    </html>
  `,
    welcomeEmail: (name) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica',
            'Arial', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #f9f9f9;
          padding: 40px 20px;
          text-align: center;
          border-bottom: 1px solid #e0e0e0;
        }
        .header h1 {
          font-size: 28px;
          color: #333333;
          font-weight: 600;
        }
        .content {
          padding: 40px 20px;
        }
        .content p {
          color: #666666;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .content strong {
          color: #333333;
        }
        .features {
          list-style: none;
          padding: 20px 0;
        }
        .features li {
          padding: 12px 0;
          color: #666666;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
        }
        .features li:last-child {
          border-bottom: none;
        }
        .features li::before {
          content: "✓";
          color: #333333;
          font-weight: bold;
          margin-right: 12px;
          font-size: 18px;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #999999;
        }
        .footer p {
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your email has been verified and your account is now active. Welcome to our community!</p>
          
          <p>You can now:</p>
          <ul class="features">
            <li>Log in to your account</li>
            <li>Start using our services</li>
            <li>Connect with other users</li>
            <li>Access exclusive features</li>
          </ul>
          
          <p style="margin-top: 30px;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <p style="margin-top: 20px;">
            Happy to have you on board!<br>
            <strong>The Team</strong>
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Your Application. All rights reserved.</p>
          <p>Need help? Contact our support team</p>
        </div>
      </div>
    </body>
    </html>
  `,
    passwordResetEmail: (name, resetLink) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica',
            'Arial', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #f9f9f9;
          padding: 40px 20px;
          text-align: center;
          border-bottom: 1px solid #e0e0e0;
        }
        .header h1 {
          font-size: 28px;
          color: #333333;
          font-weight: 600;
        }
        .content {
          padding: 40px 20px;
        }
        .content p {
          color: #666666;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .content strong {
          color: #333333;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 40px;
          background-color: #333333;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background-color: #1a1a1a;
        }
        .link-section {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 6px;
          margin-top: 20px;
          border-left: 4px solid #333333;
        }
        .link-section p {
          margin-bottom: 10px;
          font-size: 14px;
        }
        .link-section a {
          color: #333333;
          word-break: break-all;
          text-decoration: none;
        }
        .warning {
          background-color: #fef5f5;
          padding: 15px;
          border-left: 4px solid #d9534f;
          margin-top: 20px;
          border-radius: 4px;
        }
        .warning p {
          color: #c9302c;
          font-size: 14px;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #999999;
        }
        .footer p {
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          
          <div class="button-container">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <div class="link-section">
            <a href="${resetLink}">${resetLink}</a>
            <p style="margin-top: 10px; font-size: 12px; color: #999999;">This link will expire in 1 hour.</p>
          </div>
          
          <div class="warning">
            <p><strong>⚠ Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support immediately.</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2024 Your Application. All rights reserved.</p>
          <p>Need help? Contact our support team</p>
        </div>
      </div>
    </body>
    </html>
  `,
};
//# sourceMappingURL=email.templates.js.map