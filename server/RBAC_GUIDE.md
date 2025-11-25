# Role-Based Access Control (RBAC) System

## Overview
The authentication system now includes role-based access control with two roles:
- **USER** (default) - Regular users
- **ADMIN** - Administrative users

---

## How It Works

### 1. **User Model**
```prisma
enum UserRole {
  ADMIN
  USER
}

model User {
  id    String   @id @default(cuid())
  role  UserRole @default(USER)
  // ... other fields
}
```
Every user is assigned a role, defaulting to `USER`.

---

### 2. **Token Payload (JWT)**
When a user logs in, the JWT token includes their role:

```typescript
interface TokenPayload {
  userId: string;
  email: string;
  role?: string;  // Added in this update
  iat?: number;
  exp?: number;
}
```

**Example decoded token:**
```json
{
  "userId": "clh7x8m9k0000qz08z0z0z0z0",
  "email": "admin@example.com",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700003600
}
```

---

### 3. **Request Authentication**
The `authenticate` middleware:
1. Extracts the Bearer token from `Authorization` header
2. Verifies and decodes the token
3. Attaches user info (including role) to `req.user`

**Example:**
```typescript
// After authenticate middleware
req.user = {
  userId: "clh7x8m9k0000qz08z0z0z0z0",
  email: "admin@example.com",
  role: "ADMIN"
}
```

---

### 4. **Role Authorization**
The `authorize` middleware checks if the user has permission:

```typescript
// Only ADMINs can access
router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);

// ADMINs or the user themselves can access
router.get('/profile', authenticate, authorize('ADMIN', 'USER'), getProfile);

// Multiple roles allowed
router.post('/chat', authenticate, authorize('ADMIN', 'USER'), createChat);
```

---

## Middleware Stack

### Authenticate (Required)
```typescript
import { authenticate } from '../middleware/auth.middleware';

// Protects route - returns 401 if no valid token
router.post('/logout', authenticate, logout);
```

### Authorize (Optional - depends on route)
```typescript
import { authenticate, authorize } from '../middleware/auth.middleware';

// Only admins can delete users
router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);

// Both roles allowed
router.get('/feed', authenticate, authorize('ADMIN', 'USER'), getFeed);
```

---

## API Flow Example

### Login Request
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clh7x8m9k0000qz08z0z0z0z0",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Note: `refreshToken` is sent as HTTP-only cookie (not visible in response)

---

### Protected Route with Role Check
```http
DELETE /api/v1/users/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Flow:**
1. `authenticate` middleware verifies token
2. `authorize('ADMIN')` checks if `req.user.role === 'ADMIN'`
3. If authorized → execute route handler
4. If not authorized → return 403 Forbidden

---

## Error Responses

### 401 - Not Authenticated
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 - Insufficient Permissions
```json
{
  "success": false,
  "message": "Insufficient permissions. Required roles: ADMIN"
}
```

---

## Database Integration

### Creating an Admin User
```typescript
const adminUser = await prisma.user.create({
  data: {
    name: "Admin",
    email: "admin@example.com",
    password: hashedPassword,
    role: "ADMIN",  // Set as ADMIN
    emailVerified: true
  }
});
```

### Creating a Regular User
```typescript
const regularUser = await prisma.user.create({
  data: {
    name: "John",
    email: "john@example.com",
    password: hashedPassword,
    role: "USER",  // Default - can be omitted
    emailVerified: true
  }
});
```

---

## Usage Examples

### Admin-Only Endpoint
```typescript
router.delete(
  '/users/:id',
  authenticate,
  authorize('ADMIN'),
  deleteUser
);
```

### User & Admin Can Access
```typescript
router.get(
  '/profile',
  authenticate,
  authorize('USER', 'ADMIN'),
  getProfile
);
```

### Add New Role (Future)
```prisma
enum UserRole {
  ADMIN
  USER
  MODERATOR  // New role
}
```

Then use: `authorize('ADMIN', 'MODERATOR')`

---

## Security Notes

✅ Roles are stored in JWT token for quick access  
✅ Roles are verified on every protected request  
✅ Roles are also stored in database (single source of truth)  
✅ Tokens expire → require refresh → database role check  
✅ Token tampering is detected during verification  
✅ HTTP-only cookies prevent XSS attacks on refresh token  

---

## Summary

| Concept | Description |
|---------|-------------|
| **Roles** | ADMIN, USER (defined in Prisma enum) |
| **Storage** | Database (User.role) + JWT token |
| **Verification** | On every request with `authenticate` middleware |
| **Authorization** | Role check with `authorize()` middleware |
| **Default Role** | USER (assigned at registration) |
| **Change Role** | Update user in database (admin only) |
