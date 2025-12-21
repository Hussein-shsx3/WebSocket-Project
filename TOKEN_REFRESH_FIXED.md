# Token Refresh Flow - Fixed

## Problem
When access token expires, the refresh token request was failing with "No token provided" because the refresh token cookie wasn't being sent with the request.

## Root Cause
The axios instance was not configured with `withCredentials: true`, so httpOnly cookies (including the refresh token) were not being sent in requests.

## Solution Applied

### Client-side Fix (`client/src/lib/axios.ts`)
Added `withCredentials: true` to the main axios instance:

```typescript
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests (needed for refresh token)
});
```

This ensures that:
1. All requests (including refresh token request) include cookies
2. The httpOnly refresh token cookie is automatically sent by the browser
3. The server can access and validate the refresh token

### Server Configuration
Already properly configured in `server/src/app.ts`:

```typescript
// CORS Configuration
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true, // ✅ Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Cookie parser (for refresh token cookie)
app.use(cookieParser()); // ✅ Parse cookies
```

## How Token Refresh Works Now

### Flow Diagram
```
1. User logs in → Server sends httpOnly refreshToken cookie
2. Access token expires after 30 minutes
3. User makes request → 401 Unauthorized response
4. Axios interceptor catches 401
5. Interceptor sends refresh request with withCredentials: true
6. Browser automatically includes refreshToken cookie
7. Server validates refresh token
8. Server returns new access token
9. Axios retries original request with new token
10. User session continues without login redirect
```

### Detailed Flow

#### Step 1: Login
```
Client: POST /auth/login
Server: 
  - Validates credentials
  - Generates access token (30 min expiry)
  - Generates refresh token (7 day expiry)
  - Sets refreshToken as httpOnly cookie
  - Returns accessToken in response body
Client:
  - Stores accessToken in js-cookie (accessible)
  - Browser automatically stores refreshToken cookie (httpOnly)
```

#### Step 2: Request with Expired Access Token
```
Client: GET /friends
  - Adds: Authorization: Bearer <expired-access-token>
  - withCredentials: true → browser includes refreshToken cookie
Server:
  - Validates access token → EXPIRED
  - Returns: 401 Unauthorized
```

#### Step 3: Automatic Token Refresh
```
Client Interceptor:
  - Detects 401 response
  - Checks if URL is /auth/refresh-tokens → if yes, logout
  - Creates refresh request:
    POST /auth/refresh-tokens
    {
      withCredentials: true,
      headers: { "Content-Type": "application/json" }
    }
  - Browser automatically includes refreshToken cookie

Server:
  - Extracts refreshToken from cookies
  - Validates: exists, matches DB, not expired
  - Generates new tokens
  - Updates stored refreshToken in DB
  - Returns new accessToken in response

Client Interceptor:
  - Stores new accessToken
  - Retries original request with new token
  - Returns data to user
```

#### Step 4: Continued Session
```
User experiences seamless session continuation
- No login redirect
- No manual re-authentication needed
- New access token valid for another 30 minutes
```

## Key Points

### Why `withCredentials: true` is Critical
- Without it, the browser doesn't send httpOnly cookies
- The server receives: `req.cookies?.refreshToken` = undefined
- Results in: "No token provided" / "Invalid session" error

### Why httpOnly Cookies for Refresh Token
- Cannot be accessed via JavaScript
- Protected from XSS attacks
- Only sent over HTTPS in production
- Browser handles automatically

### Why Access Token in Local Storage (js-cookie)
- Needs to be accessible in JavaScript (for Authorization header)
- 30-minute expiry means security risk is limited
- Refresh token (httpOnly) provides long-term security

### Why Multiple Concurrent Requests Work
- `isRefreshing` flag prevents multiple refresh attempts
- Other requests are queued in `failedQueue`
- After successful refresh, all queued requests retry
- Prevents race conditions

## Testing

### Test Token Expiry
1. Login to application
2. Open DevTools → Application → Cookies
3. Verify both cookies exist:
   - `accessToken` (js-cookie, 30 min)
   - `refreshToken` (httpOnly, 7 days)
4. Wait 30 minutes (or modify JWT_ACCESS_EXPIRE to 1 minute for testing)
5. Make a request → should automatically refresh without redirecting to login

### Expected Behavior
- User stays logged in for 7 days (refresh token expiry)
- Access token refreshes every 30 minutes transparently
- Login page only appears after 7 days or manual logout

### Debug Logs
In browser console, you'll see:
1. Initial 401 response
2. Refresh request sent
3. New token received
4. Original request retried
5. Request completes successfully

## Files Modified
- ✅ `client/src/lib/axios.ts` - Added withCredentials to main instance

## Configuration Summary

| Setting | Value | Purpose |
|---------|-------|---------|
| Access Token Expiry | 30 minutes | Short-lived, security |
| Refresh Token Expiry | 7 days | Long-lived, convenience |
| Access Token Storage | js-cookie | Accessible for headers |
| Refresh Token Storage | httpOnly cookie | Secure from XSS |
| CORS credentials | true | Allow cross-origin cookies |
| withCredentials (axios) | true | Send cookies with requests |

## Security Considerations

✅ **Secure:**
- Refresh token in httpOnly cookie (XSS safe)
- HTTPS in production (cookie secure flag)
- Refresh token validated in DB (no forgery)
- Access token short-lived (limits exposure)
- CORS restricted to CLIENT_URL

⚠️ **Monitor:**
- CSRF protection (consider adding CSRF tokens if forms change)
- Rate limiting on refresh endpoint
- Log suspicious refresh patterns
- Monitor failed refresh attempts

## Related Files
- `server/src/services/auth.service.ts` - Token validation logic
- `server/src/controllers/auth.controller.ts` - Refresh endpoint
- `client/src/lib/axios.ts` - Request/response interceptors
- `server/src/app.ts` - CORS and cookie configuration

