# Authentication & Email Service Setup Guide

## Overview

This guide explains how to use the JWT authentication system and email verification service in your Chat App backend.

---

## JWT (JSON Web Tokens) Setup

### Token Types

Your system uses **two types of tokens**:

1. **Access Token** (Short-lived: 15 minutes)
   - Used for API requests
   - Verify with `verifyAccessToken()`
   - Expires quickly for security

2. **Refresh Token** (Long-lived: 7 days)
   - Used to generate new access tokens
   - Verify with `verifyRefreshToken()`
   - Stored securely (usually in httpOnly cookies)

### Configuration (.env)

```dotenv
# Access Token (15 minutes)
JWT_SECRET="your-super-secret-access-token-key-change-in-production-min-32-chars"
JWT_EXPIRE="15m"

# Refresh Token (7 days)
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key-change-in-production-min-32-chars"
JWT_REFRESH_EXPIRE="7d"
```

### Usage Examples

#### 1. Generate Both Tokens (Login)

```typescript
import { generateAuthTokens } from "./utils/jwt.util";

// After user authentication
const tokens = generateAuthTokens({
  userId: user.id,
  email: user.email,
});

res.json({
  success: true,
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
});
```

#### 2. Verify Access Token (Middleware)

```typescript
import { authenticate } from "./middleware/auth.middleware";

// Use in routes
app.get("/api/protected", authenticate, (req, res) => {
  // req.user contains { userId, email }
  res.json({ user: req.user });
});
```

#### 3. Refresh Access Token

```typescript
import { refreshAccessToken } from "./utils/jwt.util";

app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const newTokens = refreshAccessToken(refreshToken);
    res.json({
      success: true,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
});
```

#### 4. Client-Side: Using Access Token

```typescript
// Include in API requests
const response = await fetch("/api/protected", {
  headers: {
    "Authorization": `Bearer ${accessToken}`,
  },
});
```

---

## Email Service Setup

### Configuration (.env)

```dotenv
# Gmail Configuration
EMAIL_SERVICE="gmail"
EMAIL_USER="husseinshsx3@gmail.com"
EMAIL_PASSWORD="tgtutktlosuhazsq"  # Use Gmail App Password, not regular password
EMAIL_FROM="Chat App"
VERIFICATION_EXPIRY="24h"
```

### Getting Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Find "App passwords" section
4. Select "Mail" and "Windows Computer"
5. Copy the generated 16-character password
6. Use this in `EMAIL_PASSWORD` in .env

### Available Email Functions

#### 1. Send Verification Email

```typescript
import { sendVerificationEmail } from "./services/email.service";

const verificationToken = generateEmailVerificationToken(user.id);
const verificationUrl = `http://localhost:3000/verify?token=${verificationToken}`;

await sendVerificationEmail(user.email, verificationToken, verificationUrl);
```

#### 2. Send Password Reset Email

```typescript
import { sendPasswordResetEmail } from "./services/email.service";

const resetToken = generatePasswordResetToken(user.id);
const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

await sendPasswordResetEmail(user.email, resetToken, resetUrl);
```

#### 3. Send Welcome Email

```typescript
import { sendWelcomeEmail } from "./services/email.service";

await sendWelcomeEmail(user.email, user.name);
```

#### 4. Send Custom Email

```typescript
import { sendEmail } from "./services/email.service";

await sendEmail({
  to: "user@example.com",
  subject: "Custom Subject",
  html: "<h1>Hello</h1><p>Custom email content</p>",
  text: "Fallback text content",
});
```

### Initialize Email Service

In your `server.ts`:

```typescript
import { verifyEmailService } from "./services/email.service";

// After connecting to database
const isEmailServiceReady = await verifyEmailService();
if (!isEmailServiceReady) {
  console.warn("⚠️ Email service not available");
}
```

---

## Complete Authentication Flow

### 1. User Registration

```typescript
// POST /api/auth/register
const { email, password, name } = req.body;

// Validate and hash password
const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

// Create user in database
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    emailVerified: false,
  },
});

// Generate verification token
const verificationToken = crypto.randomBytes(32).toString("hex");

// Store token in database with expiry
await prisma.emailVerification.create({
  data: {
    userId: user.id,
    token: verificationToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  },
});

// Send verification email
const verificationUrl = `${config.CLIENT_URL}/verify?token=${verificationToken}`;
await sendVerificationEmail(user.email, verificationToken, verificationUrl);

res.json({
  success: true,
  message: "User created. Check your email for verification.",
});
```

### 2. Verify Email

```typescript
// GET /api/auth/verify?token=xxx
const { token } = req.query;

const verification = await prisma.emailVerification.findUnique({
  where: { token },
});

if (!verification || verification.expiresAt < new Date()) {
  throw new Error("Invalid or expired verification token");
}

// Mark user as verified
await prisma.user.update({
  where: { id: verification.userId },
  data: { emailVerified: true },
});

// Delete verification record
await prisma.emailVerification.delete({ where: { id: verification.id } });

res.json({ success: true, message: "Email verified successfully" });
```

### 3. User Login

```typescript
// POST /api/auth/login
const { email, password } = req.body;

const user = await prisma.user.findUnique({ where: { email } });

if (!user || !(await bcrypt.compare(password, user.password))) {
  throw new AuthenticationError("Invalid credentials");
}

if (!user.emailVerified) {
  throw new Error("Please verify your email first");
}

// Generate tokens
const tokens = generateAuthTokens({
  userId: user.id,
  email: user.email,
});

// Store refresh token in database (optional but recommended)
await prisma.session.create({
  data: {
    userId: user.id,
    refreshToken: tokens.refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});

res.json({
  success: true,
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
  },
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
});
```

### 4. Protected Routes

```typescript
// Use authenticate middleware
app.get("/api/profile", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
  });

  res.json({ success: true, user });
});
```

---

## Security Best Practices

### ✅ Do's

- ✅ Use strong secret keys (minimum 32 characters)
- ✅ Store refresh tokens in httpOnly cookies
- ✅ Rotate JWT secrets periodically
- ✅ Use HTTPS in production
- ✅ Verify email addresses before allowing login
- ✅ Implement token blacklist for logout
- ✅ Use short expiry for access tokens (15 minutes)
- ✅ Use long expiry for refresh tokens (7 days)

### ❌ Don'ts

- ❌ Don't expose JWT secret in client-side code
- ❌ Don't store access tokens in localStorage (security risk)
- ❌ Don't use same secret for access and refresh tokens
- ❌ Don't hardcode email credentials
- ❌ Don't skip email verification

---

## Environment Variables

```dotenv
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chatdb"

# JWT Configuration
JWT_SECRET="your-access-token-secret-min-32-chars"
JWT_EXPIRE="15m"
JWT_REFRESH_SECRET="your-refresh-token-secret-min-32-chars"
JWT_REFRESH_EXPIRE="7d"

# Email Service
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Chat App"
VERIFICATION_EXPIRY="24h"

# Bcrypt
BCRYPT_ROUNDS=10
```

---

## Troubleshooting

### Email Not Sending

1. Check Gmail credentials are correct
2. Verify "Less secure app access" is enabled (if not using App Password)
3. Check `NODE_ENV` is not blocking emails
4. Verify internet connection

### Token Errors

| Error | Solution |
|-------|----------|
| Token expired | Use refresh token to get new access token |
| Invalid token | Token was tampered with or secret key changed |
| No token provided | Add `Authorization: Bearer <token>` header |

---

## Files Structure

```
server/
├── src/
│   ├── utils/
│   │   └── jwt.util.ts          # Token generation & verification
│   ├── services/
│   │   └── email.service.ts     # Email sending service
│   ├── middleware/
│   │   └── auth.middleware.ts   # Token authentication middleware
│   └── config/
│       └── env.config.ts        # Environment configuration
├── .env                          # Environment variables
└── package.json
```

---

## Testing with Postman

### 1. Register User

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePassword123",
  "name": "Test User"
}
```

### 2. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePassword123"
}
```

### 3. Use Access Token

```
GET http://localhost:5000/api/profile
Authorization: Bearer <accessToken>
```

### 4. Refresh Token

```
POST http://localhost:5000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

---

For more information, refer to the JWT utility and email service files in your project.
