# Authentication Flow Documentation

## Table of Contents
1. [Overview](#overview)
2. [Token Strategy](#token-strategy)
3. [Authentication Flow](#authentication-flow)
4. [Token Refresh Mechanism](#token-refresh-mechanism)
5. [Middleware Protection](#middleware-protection)
6. [Error Handling](#error-handling)
7. [Security Considerations](#security-considerations)
8. [Implementation Details](#implementation-details)

---

## Overview

This application implements a **dual-token authentication system** using:
- **Access Token**: Short-lived JWT (15 minutes) stored in a session cookie
- **Refresh Token**: Long-lived JWT (7 days) stored in an HTTP-only cookie

The system automatically refreshes expired access tokens without user intervention, providing a seamless authentication experience.

---

## Token Strategy

### Access Token
- **Storage**: Client-side session cookie (non HTTP-only)
- **Lifetime**: 15 minutes (JWT expiration)
- **Cookie Expiration**: Session (no `maxAge` or `expires`)
- **Purpose**: Authenticate API requests
- **Sent via**: `Authorization: Bearer <token>` header
- **Why session cookie?**: The JWT itself expires in 15 minutes. The cookie doesn't need an expiration—letting it persist as a session cookie ensures the interceptor can read it and get a 401 response to trigger refresh.

### Refresh Token
- **Storage**: Server-side HTTP-only cookie
- **Lifetime**: 7 days (JWT expiration)
- **Cookie Expiration**: 7 days (`maxAge: 7 * 24 * 60 * 60 * 1000`)
- **Purpose**: Obtain new access tokens
- **Sent via**: Automatic cookie inclusion with `credentials: 'include'`
- **Security**: Cannot be accessed by JavaScript (XSS protection)

---

## Authentication Flow

### 1. User Registration

```
Client                    Server                   Database
  |                         |                          |
  |-- POST /auth/register ->|                          |
  |    (name, email, pass)  |                          |
  |                         |-- Create user --------->|
  |                         |<- User created ----------|
  |                         |-- Generate token ------->|
  |                         |   (EmailVerification)    |
  |                         |-- Send email ----------->|
  |<- 201 Created ----------|                          |
  |   (user, verifyToken)   |                          |
```

**Steps:**
1. Client submits registration form
2. Server hashes password with bcrypt
3. Creates user record in database
4. Generates email verification token (hashed)
5. Sends verification email
6. Returns user data and verification token

### 2. Email Verification

```
Client                    Server                   Database
  |                         |                          |
  |-- GET /auth/verify ---->|                          |
  |    ?token=xxx           |                          |
  |                         |-- Hash & verify -------->|
  |                         |<- Token valid -----------|
  |                         |-- Update user.verified ->|
  |                         |-- Delete token record -->|
  |<- 200 Success ----------|                          |
```

**Steps:**
1. User clicks verification link in email
2. Server hashes provided token
3. Looks up hashed token in database
4. Verifies token hasn't expired
5. Marks user as verified
6. Deletes verification record

### 3. User Login

```
Client                    Server                   Database
  |                         |                          |
  |-- POST /auth/login ---->|                          |
  |    (email, password)    |                          |
  |                         |-- Find user ------------>|
  |                         |<- User data -------------|
  |                         |-- Compare password ----->|
  |                         |   (bcrypt)               |
  |                         |-- Generate tokens ------>|
  |                         |   (access + refresh)     |
  |                         |-- Save refreshToken ---->|
  |<- 200 Success ----------|                          |
  |   Set-Cookie: refresh   |                          |
  |   Body: { accessToken } |                          |
  |                         |                          |
  |-- Store accessToken --->|                          |
  |   (session cookie)      |                          |
```

**Steps:**
1. Client submits login credentials
2. Server validates email and password
3. Generates access token (15min) and refresh token (7d)
4. Stores refresh token in database
5. Sets refresh token as HTTP-only cookie
6. Returns access token in response body
7. Client stores access token in session cookie

### 4. Making Authenticated Requests

```
Client                    Axios Interceptor         Server
  |                              |                      |
  |-- API Request -------------->|                      |
  |                              |                      |
  |                              |-- Add Authorization ->|
  |                              |   Bearer <token>     |
  |                              |                      |
  |                              |<- 200 Success -------|
  |<- Response ------------------|                      |
```

**Steps:**
1. Client makes API request
2. Request interceptor reads access token from cookie
3. Attaches token to `Authorization` header
4. Server validates JWT signature and expiration
5. If valid, processes request
6. Returns response

---

## Token Refresh Mechanism

### Automatic Refresh on 401

This is the **core feature** that provides seamless authentication.

```
Client Request              Axios Interceptor                Server
      |                            |                            |
      |-- API Request ------------>|                            |
      |                            |-- Bearer <expired> ------->|
      |                            |                            |
      |                            |<- 401 Unauthorized --------|
      |                            |                            |
      |                            |                            |
      |                     [Is refreshing?]                    |
      |                            |                            |
      |                         [No]                            |
      |                            |                            |
      |                     Set isRefreshing=true               |
      |                            |                            |
      |                            |-- POST /auth/refresh ----->|
      |                            |   (refreshToken cookie)    |
      |                            |                            |
      |                            |      [Validate refresh]    |
      |                            |      [Generate new tokens] |
      |                            |      [Update DB]           |
      |                            |                            |
      |                            |<- 200 OK ------------------|
      |                            |   Set-Cookie: new refresh  |
      |                            |   Body: { new accessToken }|
      |                            |                            |
      |                     Update accessToken cookie           |
      |                     Process queued requests             |
      |                     Set isRefreshing=false              |
      |                            |                            |
      |                            |-- Retry original request ->|
      |                            |   Bearer <new token>       |
      |                            |                            |
      |                            |<- 200 Success -------------|
      |<- Response ----------------|                            |
```

### Request Queueing During Refresh

When multiple requests fail simultaneously (e.g., on page load with multiple API calls):

```
Request 1 → 401 → Start refresh
Request 2 → 401 → Queue (wait for refresh)
Request 3 → 401 → Queue (wait for refresh)
              ↓
        Refresh completes
              ↓
    All requests retry with new token
```

**Steps:**
1. First 401 triggers refresh process
2. Subsequent 401s are queued
3. Once refresh succeeds, all queued requests retry
4. If refresh fails, all queued requests are rejected

### Token Refresh Flow Details

#### Client Side (axios.ts)

```typescript
// Response interceptor logic
1. Catch 401 error
2. Check if URL is auth endpoint → Skip refresh
3. Check if already retried → Redirect to login
4. Check if currently refreshing → Queue request
5. Set isRefreshing = true
6. Call /auth/refresh-tokens
7. On success:
   - Store new access token
   - Update queued requests
   - Retry original request
8. On failure:
   - Clear tokens
   - Redirect to login
9. Set isRefreshing = false
```

#### Server Side (auth.service.ts)

```typescript
// refreshToken method
1. Verify refresh token JWT signature
2. Find user in database
3. Compare refresh token with stored version
4. If mismatch → Invalid token (possible theft)
5. Generate new access token (15min)
6. Generate new refresh token (7d) - Token rotation
7. Update user's refresh token in database
8. Return both tokens
```

---

## Middleware Protection

### Next.js Middleware (middleware.ts)

The middleware provides **route-level protection** by checking for the refresh token cookie.

```
Request → Middleware → Check Route Type
                            ↓
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
          Root Path    Protected      Auth Page
              |            |              |
              |            |              |
        Has refresh?  Has refresh?   Has refresh?
        Yes → /chats  No → /signIn   Yes → /chats
        No → /signIn  Yes → Allow    No → Allow
```

#### Route Types

**Protected Routes** (require authentication):
- `/chats`
- `/calls`
- `/profile`
- `/settings`
- `/friendsRequests`

**Auth Routes** (for unauthenticated users):
- `/signIn`
- `/signUp`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

#### Middleware Logic

```typescript
1. Check if refresh token cookie exists
2. Determine route type (protected/auth/root)
3. Apply routing rules:
   - Root (/) → Redirect based on auth status
   - Protected → Require refresh token, redirect to signIn if missing
   - Auth pages → Redirect to chats if authenticated
4. Allow request to proceed or redirect
```

**Important:** The middleware only checks for token **existence**, not validity. Token validation happens at the application level through `useAuthBootstrap`.

---

## Error Handling

### Token Refresh Failures

When token refresh fails, the system handles it gracefully:

```typescript
try {
  // Attempt refresh
  const response = await axiosInstance.post("/auth/refresh-tokens");
  // Success: Update tokens and retry
} catch (err) {
  // Failure scenarios:
  // 1. Refresh token expired
  // 2. Refresh token invalid/tampered
  // 3. User deleted/disabled
  // 4. Network error
  
  processQueue(err); // Reject all queued requests
  setAccessToken(null); // Clear client token
  
  // Redirect to login (unless already on auth page)
  if (!isOnAuthPage) {
    window.location.href = "/signIn";
  }
}
```

### Network Errors

For network failures (not 401):

```typescript
if (!error.response || error.response.status !== 401) {
  // Pass through immediately, no refresh attempt
  return Promise.reject(error);
}
```

### Preventing Infinite Loops

```typescript
// Mark request as retried
originalRequest._retry = true;

// On second 401, don't retry again
if (originalRequest._retry) {
  // Clear tokens and redirect
  return Promise.reject(error);
}
```

---

## Security Considerations

### 1. **Token Storage**

| Token Type | Storage | Accessible by JS | XSS Safe | CSRF Risk |
|------------|---------|------------------|----------|-----------|
| Access Token | Session Cookie | ✅ Yes | ❌ No | ⚠️ Low* |
| Refresh Token | HTTP-only Cookie | ❌ No | ✅ Yes | ⚠️ Mitigated** |

*Low risk because access token is short-lived (15 minutes)
**Mitigated by `sameSite: "lax"` cookie attribute

### 2. **Token Rotation**

Every refresh generates **new** refresh tokens (token rotation):

```typescript
// Old refresh token is replaced
await prisma.user.update({
  where: { id: user.id },
  data: { refreshToken: newRefreshToken },
});
```

**Benefits:**
- Limits damage if refresh token is stolen
- Stolen token becomes invalid after legitimate use
- Helps detect token theft (multiple refresh attempts)

### 3. **HTTPS-Only in Production**

```typescript
secure: process.env.NODE_ENV === "production"
```

In production, cookies are only sent over HTTPS, preventing man-in-the-middle attacks.

### 4. **SameSite Cookie Protection**

```typescript
sameSite: "lax"
```

Protects against CSRF attacks by preventing cookie transmission on cross-site requests (except safe methods like GET).

### 5. **Token Expiration**

- **Access Token (15min)**: Limits exposure if stolen
- **Refresh Token (7d)**: Balances security with user convenience

### 6. **Password Hashing**

```typescript
const hashedPassword = await bcrypt.hash(
  password,
  parseInt(process.env.BCRYPT_ROUNDS || "10")
);
```

Uses bcrypt with configurable salt rounds (default: 10).

---

## Implementation Details

### Application Bootstrap (useAuthBootstrap)

Runs **once** on app load to restore authentication state:

```typescript
useAuthBootstrap() {
  1. Check if access token exists in cookie
  2. If yes → Fetch current user
  3. If no → Attempt token refresh
  4. If refresh succeeds → Fetch current user
  5. If refresh fails → User is not authenticated
  6. Cache user in React Query
}
```

This ensures:
- Existing sessions are preserved
- Expired access tokens are refreshed
- Invalid sessions are cleared

### React Query Integration

```typescript
// Cache current user
queryClient.setQueryData(["currentUser"], user);

// Clear on logout
queryClient.clear();
```

Benefits:
- Single source of truth for auth state
- Automatic re-fetching when stale
- Optimistic updates

### Cookie Configuration

#### Backend (Express)

```typescript
const getCookieOptions = () => ({
  httpOnly: true,              // Prevent JS access
  secure: NODE_ENV === "production", // HTTPS only in prod
  sameSite: "lax",             // CSRF protection
  path: "/",                   // Available on all routes
});

const getRefreshTokenCookieConfig = () => ({
  ...getCookieOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

#### Frontend (js-cookie)

```typescript
// Access token - session cookie
Cookies.set("accessToken", token, {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production"
  // No maxAge - session cookie
});
```

### CORS Configuration

Required for cookie transmission:

```typescript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // Allow cookies
}));
```

And on client:

```typescript
axios.create({
  withCredentials: true, // Send cookies with requests
});
```

---

## Flow Diagrams

### Complete Authentication Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                     User Journey                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
                    [Register Account]
                           │
                           ↓
                  [Receive Email] → [Verify Email]
                           │
                           ↓
                      [Login]
                           │
                           ↓
              ┌────────[Authenticated]────────┐
              │                                │
              ↓                                ↓
      [Use Application]              [Access Token Expires]
              │                                │
              │                                ↓
              │                    [Automatic Refresh (Seamless)]
              │                                │
              │                                ↓
              └────────────────────────────────┤
                                               │
                                               ↓
                                    [Refresh Token Expires]
                                               │
                                               ↓
                                        [Redirect to Login]
```

### Token Lifecycle

```
Access Token (15 minutes):
0min ───────────────────── 15min
 │                           │
 │ ← Active & Valid →        │ Expired
 │                           │
 └───────────────────────────┴→ Triggers Refresh

Refresh Token (7 days):
0min ─────────────────────────────────── 7days
 │                                         │
 │ ← Can generate new access tokens →     │ Expired
 │                                         │
 └─────────────────────────────────────────┴→ Requires Login
```

---

## Testing the Flow

### Manual Testing Steps

1. **Login**
   - Verify access token in session cookie
   - Verify refresh token in HTTP-only cookie
   - Verify redirect to `/chats`

2. **Make API Request**
   - Open Network tab
   - Check `Authorization` header has Bearer token
   - Verify successful response

3. **Test Token Refresh**
   - Wait 15+ minutes (or manually expire token in DB)
   - Make any API request
   - Verify automatic refresh in Network tab
   - Check for POST to `/auth/refresh-tokens`
   - Verify new access token received

4. **Test Logout**
   - Click logout
   - Verify cookies cleared
   - Verify redirect to `/signIn`
   - Verify cannot access protected routes

5. **Test Middleware**
   - Try accessing `/chats` without login → Redirect to `/signIn`
   - Login, then try accessing `/signIn` → Redirect to `/chats`

### Automated Testing

```typescript
// Example test cases
describe("Authentication Flow", () => {
  it("should refresh access token on 401", async () => {
    // Mock expired access token
    // Make request
    // Verify refresh was called
    // Verify request succeeded with new token
  });

  it("should redirect to login on refresh failure", async () => {
    // Mock invalid refresh token
    // Make request
    // Verify redirect to /signIn
  });

  it("should queue concurrent requests during refresh", async () => {
    // Make multiple simultaneous requests with expired token
    // Verify only one refresh call
    // Verify all requests succeed
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. **Infinite Redirect Loop**

**Symptom:** Page keeps redirecting between `/chats` and `/signIn`

**Causes:**
- Middleware detects refresh token but it's invalid
- `useAuthBootstrap` fails to validate

**Solution:**
- Clear all cookies
- Check server logs for refresh token validation errors

#### 2. **401 on Every Request**

**Symptom:** All requests fail with 401, no refresh attempt

**Causes:**
- Access token not being set after login
- Axios interceptor not reading token correctly

**Debug:**
```typescript
console.log("Access token:", getAccessToken());
console.log("Has refresh cookie:", document.cookie.includes("refreshToken"));
```

#### 3. **Refresh Token Not Sent**

**Symptom:** Refresh endpoint returns "Refresh token missing"

**Causes:**
- `withCredentials: true` not set on axios
- CORS not configured for credentials
- Cookie `sameSite` mismatch with domain setup

**Solution:**
- Verify axios config has `withCredentials: true`
- Check CORS allows credentials: `credentials: true`
- Ensure client and server on same domain or proper CORS setup

#### 4. **Token Cleared After Refresh**

**Symptom:** Token refreshes but immediately disappears

**Causes:**
- Cookie options mismatch between set and clear
- Path mismatch (set with `/api`, clear with `/`)

**Solution:**
- Use consistent `getCookieOptions()` function
- Verify path is always `/`

---

## Best Practices

### 1. **Never Store Sensitive Data in Access Token**

Access tokens are readable by JavaScript. Store only:
- User ID
- Email
- Role

Never store:
- Passwords
- Payment info
- Personal data

### 2. **Implement Token Blacklisting (Optional)**

For high-security applications, maintain a blacklist of revoked tokens:

```typescript
// On logout or password change
await prisma.tokenBlacklist.create({
  data: {
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});
```

### 3. **Monitor Failed Refresh Attempts**

```typescript
// In auth.controller.ts
console.error("❌ Refresh token failed:", {
  message: error?.message,
  userId: req.user?.userId,
  timestamp: new Date().toISOString(),
});
```

Analyze logs for:
- Unusual patterns (potential theft)
- High failure rates (bugs)
- Geographic anomalies

### 4. **Implement Rate Limiting**

Prevent brute force attacks on refresh endpoint:

```typescript
import rateLimit from "express-rate-limit";

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many refresh attempts",
});

router.post("/auth/refresh-tokens", refreshLimiter, refreshTokens);
```

### 5. **Use Environment Variables**

Never hardcode sensitive values:

```bash
# .env
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=production
```

---

## Conclusion

This authentication system provides:

✅ **Security**: HTTP-only cookies, token rotation, short-lived access tokens  
✅ **User Experience**: Automatic token refresh, seamless authentication  
✅ **Scalability**: Stateless JWTs, minimal server load  
✅ **Maintainability**: Clear separation of concerns, well-documented flow  

The dual-token approach with automatic refresh balances security and convenience, providing a production-ready authentication solution.