# Google OAuth Implementation Guide

## Overview

Complete Google OAuth 2.0 implementation for the WebSocket-Project authentication system. Users can sign in/sign up using their Google accounts with automatic email verification.

## Architecture

### Server-Side Flow

1. **Google Auth Config** (`server/src/config/google-auth.config.ts`)
   - Passport.js GoogleStrategy configured
   - Validates Google credentials from environment
   - Auto-creates/updates users in database
   - Sets `emailVerified: true` for Google accounts (trusted email)
   - Handles both new and existing users

2. **Google Auth Routes** (`server/src/routes/google-auth.route.ts`)
   - `GET /api/v1/auth/google` - Initiates OAuth flow (redirects to Google login)
   - `GET /api/v1/auth/google/callback` - OAuth callback handler

3. **Google Auth Controller** (`server/src/controllers/google-auth.controller.ts`)
   - `googleCallback()` - Handles post-authentication:
     - Generates JWT tokens (access + refresh)
     - Sets httpOnly refresh token cookie
     - Redirects to client callback URL with token + user data in query params
   - User and token data passed as URL params for client processing

### Client-Side Flow

#### 1. Authentication Initiation
- User clicks "Sign in/up with Google" button
- `GoogleButton` component triggers `authService.initiateGoogleAuth()`
- Redirects to: `{SERVER_URL}/api/v1/auth/google`

#### 2. Google Login
- User logs in with Google account
- Grants email + profile permissions
- Google redirects to server callback

#### 3. Server Processing
- Passport middleware validates authorization code
- Server finds/creates user in database
- Generates JWT tokens
- Sets httpOnly refresh token cookie
- Redirects to: `{CLIENT_URL}/auth/google/callback?token=...&user=...`

#### 4. Client Callback Handler
**File:** `client/src/app/(auth)/google-callback/page.tsx`

- Extracts token and user data from URL params
- Stores access token via `tokenManager.setAccessToken()`
- Shows loading spinner during processing
- Handles errors gracefully with timeout redirect
- Redirects to `/chats` on success

### Service Layer

**File:** `client/src/services/auth.service.ts`

```typescript
// Initiates Google OAuth flow
authService.initiateGoogleAuth(): void
```

### Custom Hook

**File:** `client/src/hooks/useGoogleAuth.ts`

```typescript
const { handleGoogleAuth } = useGoogleAuth();
```

Simple wrapper around `authService.initiateGoogleAuth()` for easy integration in components.

## Component Integration

### GoogleButton Component
**File:** `client/src/components/ui/form/GoogleButton.tsx`

Props:
- `text?: string` - Button text (default: "Sign in with Google")
- `onClick?: () => void` - Custom click handler (optional)
- `isLoading?: boolean` - Loading state

Default behavior: Redirects to Google OAuth endpoint

```tsx
<GoogleButton text="Sign Up with Google" />
```

### Usage in Auth Pages

**SignIn:**
```tsx
<GoogleButton /> {/* Default: "Sign in with Google" */}
```

**SignUp:**
```tsx
<GoogleButton text="Sign Up with Google" />
```

## Key Features

✅ **Automatic Email Verification** - Google emails trusted, no verification needed
✅ **Unified Auth** - Same user can sign in via email or Google
✅ **Error Handling** - Graceful errors with auto-redirect
✅ **Security** - Token stored securely, httpOnly cookies for refresh token
✅ **Loading States** - Visual feedback during OAuth flow
✅ **User Data Preserved** - Name, avatar stored from Google profile

## Configuration

### Environment Variables (Server)

```env
# .env.server
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### Environment Variables (Client)

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Google Cloud Console Setup

1. Create OAuth 2.0 credentials (Desktop application)
2. Add callback URL: `http://localhost:5000/api/v1/auth/google/callback`
3. Copy Client ID and Client Secret to server .env

## Error Handling

### User Flow

1. **Invalid/Missing Token** → Error message + auto-redirect to SignIn (2s)
2. **Parse Error** → Error logged, user redirected to SignIn
3. **Network Error** → Handled by OAuth provider, user sees Google error

### Server-Side

- Missing Google credentials → Warning logged, auth disabled
- OAuth verification failure → Redirects to error page
- Database error → Caught by async handler, error response

## Database Changes

### User Model Enhancement
```prisma
model User {
  id                 String    @id @default(cuid())
  email              String    @unique
  password           String?   // Optional for Google-only accounts
  name               String?
  avatar             String?   // Stored from Google profile
  googleId           String?   @unique
  emailVerified      Boolean   @default(false) // true for Google users
  role               String    @default("USER")
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}
```

## Security Considerations

1. **Token Handling**
   - Access token in response body (client-readable)
   - Refresh token in httpOnly cookie (browser auto-send, JS-protected)

2. **User Email**
   - Google emails verified by Google, trusted as primary identity
   - Auto-verified without additional email confirmation

3. **CORS & Security Headers**
   - SameSite cookie policy: `strict`
   - Secure flag enabled in production
   - Token validation in middleware before page render

## Testing the OAuth Flow

### Manual Testing

1. **Start servers:**
   ```bash
   # Terminal 1: Server
   npm run dev

   # Terminal 2: Client
   npm run dev
   ```

2. **Test SignIn:**
   - Go to `/signIn`
   - Click "Sign in with Google"
   - Log in with test Google account
   - Should redirect to `/chats` with access token stored

3. **Test SignUp:**
   - Go to `/signUp`
   - Click "Sign Up with Google"
   - First-time users auto-created and verified
   - Should redirect to `/chats`

4. **Verify Token Storage:**
   - Open DevTools → Application → Cookies
   - Check: `refreshToken` (httpOnly, cannot read via JS)
   - Check: token stored in memory via `tokenManager`

### Debugging

- **Console logs:** Server logs user creation/update
- **Network tab:** Watch redirect chain: Google → Server → Client callback
- **Local storage:** Access token not stored (in-memory only for security)

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid verification token" | Missing GOOGLE_CLIENT_ID/SECRET | Set env variables in .env.server |
| Blank page after Google login | Token/user data missing in URL | Check server logs for OAuth errors |
| Infinite redirect loop | Missing callback page | Verify `/auth/google/callback` page exists |
| Cannot read user data | Encoding issue | Check `decodeURIComponent()` in callback handler |
| Redirect to error page | OAuth verification failed | Check Google credentials in Cloud Console |

## Future Enhancements

- [ ] LinkedIn OAuth
- [ ] GitHub OAuth
- [ ] Facebook OAuth
- [ ] OAuth token refresh handling
- [ ] Account linking (connect Google to email account)
- [ ] Avatar caching from Google

## Files Modified/Created

**Server (No changes needed - already configured)**
- `src/config/google-auth.config.ts` ✅
- `src/routes/google-auth.route.ts` ✅
- `src/controllers/google-auth.controller.ts` ✅

**Client (New/Modified)**
- `src/app/(auth)/google-callback/page.tsx` ✨ NEW
- `src/hooks/useGoogleAuth.ts` ✨ NEW
- `src/services/auth.service.ts` ✅ UPDATED (added initiateGoogleAuth)
- `src/components/ui/form/GoogleButton.tsx` ✅ (no changes needed, already correct)

## References

- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth 2.0 Flow](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
