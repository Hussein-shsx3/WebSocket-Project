# Middleware Authentication Guide

## Overview

The middleware handles all route protection on the **server-side** before the page renders. This is the **best practice** approach for Next.js 13+ with App Router.

## How It Works

### 1. **Request Flow**
```
User requests /chats
   ↓
Middleware intercepts request
   ↓
Reads accessToken from cookies
   ↓
Decodes JWT without verification (for basic checks)
   ↓
Validates token expiry
   ↓
Routes accordingly:
   - Protected route + no token → Redirect to /signIn
   - Protected route + valid token → Allow access
   - Auth route + valid token → Redirect to /chats
   - Other routes → Allow access
```

### 2. **Protected Routes**
```typescript
const protectedRoutes = ["/chats", "/calls", "/profile"];
```
These routes require a valid `accessToken` cookie.

### 3. **Auth Routes**
```typescript
const authRoutes = ["/signIn", "/signUp", "/forgotPassword", "/resetPassword", "/verifyEmail"];
```
If user is authenticated, they're redirected away from these routes to `/chats`.

## Token Validation

### JWT Decoding (Client-side Safe)
```typescript
function decodeJWT(token: string): any | null {
  const base64Payload = token.split(".")[1];
  const jsonPayload = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(jsonPayload);
}
```
- **Does NOT verify** the token signature (server will do that on API calls)
- Only checks if it can be decoded
- Checks expiry time (`exp` claim)

### Expiry Check
```typescript
const isExpired = decoded.exp && Date.now() >= decoded.exp * 1000;
```
- If expired → Redirect to `/signIn`
- Server's axios interceptor will handle token refresh on API calls

## Middleware Matcher

```typescript
export const config = {
  matcher: [
    "/chats/:path*",      // /chats and all subroutes
    "/calls/:path*",      // /calls and all subroutes
    "/profile/:path*",    // /profile and all subroutes
    "/signIn",            // Auth routes
    "/signUp",
    "/forgotPassword",
    "/resetPassword",
    "/verifyEmail",
  ],
};
```

Routes NOT in the matcher won't run middleware (faster performance).

## Authentication Flow

### Login
```
1. User submits credentials
   ↓
2. Server validates and returns accessToken
   ↓
3. Server sets refreshToken as httpOnly cookie
   ↓
4. Client stores accessToken in cookie (via tokenManager.setAccessToken)
   ↓
5. Next navigation → Middleware checks accessToken
   ↓
6. Valid token → Access granted to protected routes
```

### Logout
```
1. User clicks logout button
   ↓
2. Client calls /auth/logout API
   ↓
3. Server clears refreshToken cookie
   ↓
4. Client clears accessToken cookie
   ↓
5. Next navigation → No accessToken found
   ↓
6. Middleware redirects to /signIn
```

### Token Refresh (Automatic)
```
1. Protected route accessed with expired accessToken
   ↓
2. Middleware allows request through (only checks expiry)
   ↓
3. API call made with expired token
   ↓
4. Server returns 401
   ↓
5. Axios interceptor detects 401
   ↓
6. Interceptor uses refreshToken (auto-sent in httpOnly cookie)
   ↓
7. Server returns new accessToken
   ↓
8. Axios retries original request with new token
   ↓
9. Request succeeds
```

## Key Differences from Client-Side Guards

| Aspect | Middleware | Client-Side Guards |
|--------|------------|-------------------|
| **Timing** | Runs before page renders | Runs after page renders |
| **Performance** | Faster (no client-side checks) | Slower (component renders first) |
| **Flash** | No flash of wrong content | Potential flash of protected content |
| **Security** | Better (server-controlled) | Weaker (client can be bypassed) |
| **Token Validation** | Can check expiry server-side | Limited checks on client |
| **Best Practice** | ✅ Recommended for Next.js | ❌ Not recommended |

## Configuration

### Adding New Protected Routes
1. Add route to `protectedRoutes` array
2. Add matcher pattern to `config.matcher`

Example:
```typescript
const protectedRoutes = ["/chats", "/calls", "/profile", "/settings"];
// Add to matcher:
"/settings/:path*",
```

### Adding New Auth Routes
1. Add route to `authRoutes` array
2. Add matcher pattern to `config.matcher`

Example:
```typescript
const authRoutes = [..., "/verify-email"];
// Add to matcher:
"/verify-email",
```

## Token Expiry Times

- **Access Token**: 30 minutes (JWT_EXPIRE="30m")
- **Refresh Token**: 7 days (JWT_REFRESH_EXPIRE="7d")

When access token expires:
- Middleware allows request (only warns about expiry)
- API call fails with 401
- Axios interceptor refreshes token automatically
- Request retried with new token

## Files Involved

- **`middleware.ts`** - Route protection logic
- **`src/lib/axios.ts`** - Token refresh interceptor
- **`src/hooks/useAuth.ts`** - Login/logout hooks
- **`.env`** - JWT configuration

## Testing

1. **Login** → accessToken cookie set → can access /chats
2. **Go to /signIn** → already authenticated → redirected to /chats
3. **Logout** → accessToken cookie cleared → redirected to /signIn
4. **Access /chats without token** → redirected to /signIn
5. **Wait for token expiry** → Next API call triggers refresh automatically

## Security Notes

✅ **httpOnly cookies** - refreshToken safe from XSS  
✅ **Server validation** - All tokens validated on API calls  
✅ **Middleware check** - Prevents unauthorized page access  
✅ **Automatic refresh** - Users stay logged in seamlessly  
✅ **Token expiry** - Limits exposure time of compromised tokens

## Related Documentation

- Next.js Middleware: https://nextjs.org/docs/advanced-features/middleware
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- Server-Side Rendering: https://nextjs.org/docs/basic-features/rendering
