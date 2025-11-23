# Authentication & Email Setup - Quick Reference

## ✅ What Was Created

### 1. **JWT Token Service** (`src/utils/jwt.util.ts`)
- `generateAccessToken()` - Create 15-minute access tokens
- `generateRefreshToken()` - Create 7-day refresh tokens  
- `generateAuthTokens()` - Generate both tokens at once
- `verifyAccessToken()` - Validate access tokens
- `verifyRefreshToken()` - Validate refresh tokens
- `refreshAccessToken()` - Use refresh token to get new access token
- `decodeToken()` - Decode without verification (debugging)

### 2. **Authentication Middleware** (`src/middleware/auth.middleware.ts`)
- `authenticate` - Protect routes with access token verification
- `optionalAuthenticate` - Optional auth (doesn't throw if missing)
- `isAuthenticated()` - Check if request is authenticated
- Extends `Request` type with `user` property

### 3. **Email Service** (`src/services/email.service.ts`)
- `sendEmail()` - Send custom emails
- `sendVerificationEmail()` - Email verification with link
- `sendPasswordResetEmail()` - Password reset email
- `sendWelcomeEmail()` - Welcome email for new users
- `verifyEmailService()` - Test email connection
- `initializeEmailService()` - Setup email transporter

### 4. **Updated Configuration** (`src/config/env.config.ts`)
- Added JWT secret variables
- Added email service credentials
- Added verification expiry time
- Added OAuth credentials placeholders

### 5. **Updated .env File**
```dotenv
JWT_SECRET="..." (15m access token)
JWT_REFRESH_SECRET="..." (7d refresh token)
EMAIL_SERVICE="gmail"
EMAIL_USER="husseinshsx3@gmail.com"
EMAIL_PASSWORD="tgtutktlosuhazsq"
```

---

## 🚀 Quick Start Examples

### Generate Tokens on Login
```typescript
import { generateAuthTokens } from "./utils/jwt.util";

const tokens = generateAuthTokens({
  userId: user.id,
  email: user.email,
});
// Returns: { accessToken: "...", refreshToken: "..." }
```

### Protect Routes
```typescript
import { authenticate } from "./middleware/auth.middleware";

app.get("/api/profile", authenticate, (req, res) => {
  console.log(req.user); // { userId: "...", email: "..." }
});
```

### Send Verification Email
```typescript
import { sendVerificationEmail } from "./services/email.service";

await sendVerificationEmail(
  email,
  token,
  `http://localhost:3000/verify?token=${token}`
);
```

### Refresh Access Token
```typescript
import { refreshAccessToken } from "./utils/jwt.util";

const newTokens = refreshAccessToken(refreshToken);
// Returns: { accessToken: "...", refreshToken: "..." }
```

---

## 🔐 Security Features

✅ **Access Token** - 15 minutes (short-lived)
✅ **Refresh Token** - 7 days (long-lived)  
✅ **Separate Secrets** - Different keys for each token type
✅ **HS256 Algorithm** - HMAC SHA-256 signature
✅ **Email Verification** - Verify users before login
✅ **Password Reset** - Secure token-based reset
✅ **Error Handling** - Proper error messages for expired/invalid tokens

---

## 📧 Email Setup (Gmail)

1. **Enable 2FA** on your Google account
2. **Generate App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "App passwords"
   - Select Mail + Windows Computer
   - Copy the 16-character password
3. **Update .env**:
   ```dotenv
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="16-char-app-password"
   ```

---

## 📝 Complete Authentication Flow

```
1. User Registers
   └─> Hash password
   └─> Create user in DB
   └─> Generate email verification token
   └─> Send verification email

2. User Clicks Verification Link
   └─> Verify token is valid
   └─> Mark email as verified
   └─> Delete verification token

3. User Logs In
   └─> Check credentials
   └─> Check email is verified
   └─> Generate access + refresh tokens
   └─> Send tokens to client
   └─> Store refresh token in session (optional)

4. User Makes API Request
   └─> Send: Authorization: Bearer <accessToken>
   └─> Middleware verifies token
   └─> Request proceeds with req.user data

5. Access Token Expires (15 min)
   └─> Client sends refresh token
   └─> Server generates new tokens
   └─> Client updates tokens

6. User Logs Out
   └─> Clear tokens on client
   └─> Delete session from DB (optional)
```

---

## 🧪 Testing Commands

### Login & Get Tokens
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Use Access Token
```bash
curl http://localhost:5000/api/profile \
  -H "Authorization: Bearer <accessToken>"
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

---

## 📚 Documentation

See `JWT_EMAIL_SETUP.md` for comprehensive guide with:
- Detailed setup instructions
- All available functions
- Security best practices
- Complete authentication flow
- Troubleshooting guide
- Environment variables reference

---

## 🎯 Next Steps

1. ✅ Create user model in Prisma (with `emailVerified` field)
2. ✅ Create email verification table in Prisma
3. ✅ Create session/refresh token table in Prisma
4. ✅ Implement registration endpoint
5. ✅ Implement login endpoint
6. ✅ Implement refresh endpoint
7. ✅ Implement email verification endpoint
8. ✅ Test all flows with Postman

---

## 📦 Packages Used

- `jsonwebtoken` - JWT generation & verification
- `nodemailer` - Email sending
- `bcrypt` - Password hashing
- `@types/nodemailer` - TypeScript types
- `@types/jsonwebtoken` - TypeScript types

All already installed! ✅

---

## ⚠️ Important Notes

- **Never commit .env file** to version control
- **Change JWT secrets** before production
- **Use HTTPS** in production (required for secure cookies)
- **Implement logout** with token blacklist for security
- **Set httpOnly flag** on refresh token cookies
- **Validate email format** before sending
- **Rate limit** auth endpoints to prevent brute force

---

Good luck with your Chat App! 🚀
