# Complete API Documentation - Doot (WebSocket Chat Application)

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User APIs](#user-apis)
3. [Friend APIs](#friend-apis)
4. [Conversation APIs](#conversation-apis)
5. [Message APIs](#message-apis)
6. [Call APIs](#call-apis)
7. [Google OAuth APIs](#google-oauth-apis)
8. [Common Response Format](#common-response-format)
9. [Error Handling](#error-handling)

---

## Authentication APIs

### Base URL
```
POST /api/v1/auth
GET  /api/v1/auth
```

### 1. Register (User Sign Up)
**Endpoint:** `POST /api/v1/auth/register`

**Authentication:** ❌ None required (Public)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation:**
- `name`: String, minimum 2 characters
- `email`: Valid email format
- `password`: String, minimum 6 characters

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe"
    },
    "verificationToken": "token-string"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**What Backend Needs to Do:**
- ✅ Validate request using Zod schema
- ✅ Hash password using bcrypt
- ✅ Check if user already exists
- ✅ Create user in database
- ✅ Set `emailVerified: false`
- ✅ Generate verification token (6-hour expiry)
- ✅ Send verification email with token
- ✅ Return user and verificationToken

---

### 2. Login
**Endpoint:** `POST /api/v1/auth/login`

**Authentication:** ❌ None required (Public)

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe"
    },
    "accessToken": "jwt-token"
  }
}
```

**Headers Set:**
```
Set-Cookie: refreshToken=jwt-token; HttpOnly; Secure; Path=/; Max-Age=604800
Set-Cookie: accessToken=jwt-token; Path=/; Max-Age=1800
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Email not verified. Please verify your email first."
}
```

**What Backend Needs to Do:**
- ✅ Validate request using Zod schema
- ✅ Find user by email
- ✅ Check if user exists
- ✅ Check if email is verified
- ✅ Compare password with hash
- ✅ Generate access token (30 min JWT)
- ✅ Generate refresh token (7 day JWT)
- ✅ Set cookies: `refreshToken` (httpOnly), `accessToken`
- ✅ Return user and accessToken

---

### 3. Verify Email
**Endpoint:** `GET /api/v1/auth/verify-email?token=<verification-token>`

**Authentication:** ❌ None required (Public)

**Query Parameters:**
- `token` (string, required): Email verification token

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

**What Backend Needs to Do:**
- ✅ Extract token from query params
- ✅ Verify token validity and expiry
- ✅ Find user by verification token
- ✅ Update user: `emailVerified: true`
- ✅ Clear verification token
- ✅ Return updated user

---

### 4. Resend Verification Email
**Endpoint:** `POST /api/v1/auth/resend-verification`

**Authentication:** ❌ None required (Public)

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "User not found"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Email already verified"
}
```

**What Backend Needs to Do:**
- ✅ Validate request using Zod schema
- ✅ Find user by email
- ✅ Check if email already verified
- ✅ Generate new verification token (6-hour expiry)
- ✅ Update user with new token
- ✅ Send verification email
- ✅ Return success message

---

### 5. Forgot Password
**Endpoint:** `POST /api/v1/auth/forgot-password`

**Authentication:** ❌ None required (Public)

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "User not found"
}
```

**What Backend Needs to Do:**
- ✅ Validate request using Zod schema
- ✅ Find user by email
- ✅ Generate password reset token (1-hour expiry)
- ✅ Store token in database
- ✅ Send reset link email: `${FRONTEND_URL}/resetPassword?token=<token>`
- ✅ Return success message (don't expose token)

---

### 6. Reset Password
**Endpoint:** `POST /api/v1/auth/reset-password`

**Authentication:** ❌ None required (Public)

**Request Body:**
```json
{
  "token": "password-reset-token",
  "password": "newpassword123"
}
```

**Validation:**
- `token`: String, minimum 10 characters
- `password`: String, minimum 6 characters

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**What Backend Needs to Do:**
- ✅ Validate request using Zod schema
- ✅ Verify token validity and expiry
- ✅ Find user by reset token
- ✅ Hash new password
- ✅ Update user password
- ✅ Clear reset token
- ✅ Return success message

---

### 7. Refresh Tokens
**Endpoint:** `POST /api/v1/auth/refresh-tokens`

**Authentication:** ❌ None required (Uses httpOnly cookie)

**Request Body:** `{}` (Empty, uses refreshToken from cookies)

**Cookies Required:**
```
Cookie: refreshToken=<refresh-jwt-token>
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "new-jwt-token"
  }
}
```

**Headers Set:**
```
Set-Cookie: accessToken=new-jwt-token; Path=/; Max-Age=1800
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

**What Backend Needs to Do:**
- ✅ Extract refreshToken from cookies
- ✅ Verify JWT signature
- ✅ Check expiry
- ✅ Generate new access token
- ✅ Set accessToken cookie
- ✅ Return new accessToken

---

### 8. Logout
**Endpoint:** `POST /api/v1/auth/logout`

**Authentication:** ✅ Required (JWT)

**Headers Required:**
```
Authorization: Bearer <access-token>
```

**Request Body:** `{}` (Empty)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Headers Set:**
```
Set-Cookie: refreshToken=; HttpOnly; Max-Age=0
Set-Cookie: accessToken=; Max-Age=0
```

**What Backend Needs to Do:**
- ✅ Verify JWT token from Authorization header
- ✅ Clear refresh token cookie
- ✅ Clear access token cookie
- ✅ Return success message
- ✅ (Optional) Blacklist token if implementing logout everywhere

---

## User APIs

### Base URL
```
GET  /api/v1/users
POST /api/v1/users
```

### 1. Get Current User Profile
**Endpoint:** `GET /api/v1/users/profile`

**Authentication:** ✅ Required (JWT)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://cloudinary-url.com/avatar.jpg",
      "bio": "Hello! I'm using Doot",
      "status": "online",
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT token
- ✅ Query user from database
- ✅ Return user profile with all fields

---

### 2. Update User Profile
**Endpoint:** `PATCH /api/v1/users/profile`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "bio": "Hello! I'm Jane"
}
```

**All fields optional:**
- `name` (string): New display name
- `bio` (string): User bio/status message
- `status` (string): "online" | "offline" | "away"

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar": "https://cloudinary-url.com/avatar.jpg",
      "bio": "Hello! I'm Jane",
      "status": "online",
      "updatedAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Validate request body (optional fields)
- ✅ Update user in database
- ✅ Return updated user profile

---

### 3. Upload Avatar
**Endpoint:** `POST /api/v1/users/avatar`

**Authentication:** ✅ Required (JWT)

**Content-Type:** `multipart/form-data`

**Form Data:**
```
file (binary): The image file
Field name: "avatar"
Accepted: JPG, PNG, GIF, WebP
Max size: 5MB
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "user": {
      "id": "uuid",
      "avatar": "https://cloudinary-url.com/avatar-new.jpg"
    }
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "File size exceeds 5MB limit"
}
```

**What Backend Needs to Do:**
- ✅ Validate file type (image only)
- ✅ Validate file size (max 5MB)
- ✅ Upload to Cloudinary
- ✅ Delete old avatar from Cloudinary (if exists)
- ✅ Update user avatar URL in database
- ✅ Return user with new avatar URL

---

### 4. Update User Status
**Endpoint:** `PATCH /api/v1/users/status`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "status": "online"
}
```

**Valid status values:**
- `"online"`
- `"offline"`
- `"away"`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "status": "online"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Validate status value
- ✅ Update user status in database
- ✅ Emit Socket.IO event: `userStatusChanged` to all connected users
- ✅ Return updated user status

---

### 5. Search Users
**Endpoint:** `GET /api/v1/users/search?query=john`

**Authentication:** ✅ Required (JWT)

**Query Parameters:**
- `query` (string, required): Search query (name or email)
- `limit` (number, optional): Results limit (default: 20)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Users found",
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://cloudinary-url.com/avatar.jpg",
        "status": "online"
      },
      {
        "id": "uuid2",
        "name": "John Smith",
        "email": "smith@example.com",
        "avatar": "https://cloudinary-url.com/avatar2.jpg",
        "status": "offline"
      }
    ]
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract search query from URL params
- ✅ Search users by name or email (case-insensitive)
- ✅ Exclude current user from results
- ✅ Exclude already-friends from results
- ✅ Limit results
- ✅ Return list of users

---

### 6. Get User by ID
**Endpoint:** `GET /api/v1/users/:userId`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `userId` (string, required): User ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "User found",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://cloudinary-url.com/avatar.jpg",
      "bio": "Hello! I'm using Doot",
      "status": "online",
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "User not found"
}
```

**What Backend Needs to Do:**
- ✅ Extract userId from URL params
- ✅ Query user from database
- ✅ Return user profile (without sensitive data)

---

### 7. Get All Users
**Endpoint:** `GET /api/v1/users`

**Authentication:** ✅ Required (JWT)

**Query Parameters:**
- `limit` (number, optional): Results limit (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://cloudinary-url.com/avatar.jpg",
        "status": "online"
      }
    ],
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

**What Backend Needs to Do:**
- ✅ Query all users from database
- ✅ Exclude current user
- ✅ Apply pagination (limit + offset)
- ✅ Return users with total count

---

### 8. Delete Account
**Endpoint:** `DELETE /api/v1/users/account`

**Authentication:** ✅ Required (JWT)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Delete user from database
- ✅ Delete user's avatar from Cloudinary
- ✅ Delete all conversations where user is participant
- ✅ Delete all messages from user
- ✅ Delete all friend requests (sent and received)
- ✅ Return success message

---

## Friend APIs

### Base URL
```
POST   /api/v1/friends
GET    /api/v1/friends
PATCH  /api/v1/friends
DELETE /api/v1/friends
```

### 1. Send Friend Request
**Endpoint:** `POST /api/v1/friends/request`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "recipientId": "uuid"
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "Friend request sent successfully",
  "data": {
    "friendRequest": {
      "id": "uuid",
      "senderId": "uuid",
      "recipientId": "uuid",
      "status": "pending",
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Cannot send friend request to yourself"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Friend request already exists"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Validate recipientId exists
- ✅ Check if already friends
- ✅ Check if request already exists
- ✅ Prevent sending to self
- ✅ Create friend request in database
- ✅ Emit Socket.IO event: `friendRequestReceived` to recipient
- ✅ Return created friend request

---

### 2. Accept Friend Request
**Endpoint:** `PATCH /api/v1/friends/request/:requestId/accept`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `requestId` (string, required): Friend request ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Friend request accepted",
  "data": {
    "friendship": {
      "id": "uuid",
      "user1Id": "uuid",
      "user2Id": "uuid",
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is the recipient of the request
- ✅ Delete the friend request
- ✅ Create friendship record
- ✅ Emit Socket.IO event: `friendAdded` to both users
- ✅ Return created friendship

---

### 3. Reject Friend Request
**Endpoint:** `PATCH /api/v1/friends/request/:requestId/reject`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `requestId` (string, required): Friend request ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Friend request rejected"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is the recipient
- ✅ Delete the friend request
- ✅ Emit Socket.IO event: `friendRequestRejected` to sender
- ✅ Return success message

---

### 4. Cancel Friend Request
**Endpoint:** `DELETE /api/v1/friends/request/:requestId`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `requestId` (string, required): Friend request ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Friend request cancelled"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is the sender of request
- ✅ Delete the friend request
- ✅ Emit Socket.IO event: `friendRequestCancelled` to recipient
- ✅ Return success message

---

### 5. Get Friend Requests
**Endpoint:** `GET /api/v1/friends/requests?type=pending`

**Authentication:** ✅ Required (JWT)

**Query Parameters:**
- `type` (string, optional): "pending" (default) or "sent"

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Friend requests fetched",
  "data": {
    "friendRequests": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "sender": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "https://cloudinary-url.com/avatar.jpg"
        },
        "recipientId": "uuid",
        "status": "pending",
        "createdAt": "2025-12-21T10:00:00Z"
      }
    ]
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Get type from query params
- ✅ If type="pending": Get requests where user is recipient
- ✅ If type="sent": Get requests where user is sender
- ✅ Populate sender/recipient details
- ✅ Return friend requests list

---

### 6. Get Friends List
**Endpoint:** `GET /api/v1/friends`

**Authentication:** ✅ Required (JWT)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Friends list fetched",
  "data": {
    "friends": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://cloudinary-url.com/avatar.jpg",
        "status": "online"
      }
    ]
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Query all friendships where user is participant
- ✅ Get the other user's details in each friendship
- ✅ Return list of friends with their info

---

### 7. Remove Friend
**Endpoint:** `DELETE /api/v1/friends/:friendId`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `friendId` (string, required): Friend user ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Friend removed successfully"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify friendship exists
- ✅ Delete friendship record
- ✅ Emit Socket.IO event: `friendRemoved` to both users
- ✅ Return success message

---

## Conversation APIs

### Base URL
```
POST   /api/v1/conversations
GET    /api/v1/conversations
PATCH  /api/v1/conversations
DELETE /api/v1/conversations
```

### 1. Get or Create Conversation
**Endpoint:** `POST /api/v1/conversations`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "friendId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation retrieved or created",
  "data": {
    "conversation": {
      "id": "uuid",
      "participants": [
        {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "https://cloudinary-url.com/avatar.jpg"
        },
        {
          "id": "uuid2",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": "https://cloudinary-url.com/avatar2.jpg"
        }
      ],
      "lastMessage": {
        "id": "uuid",
        "content": "Hello!",
        "sender": {
          "id": "uuid",
          "name": "John Doe"
        },
        "createdAt": "2025-12-21T10:00:00Z"
      },
      "unreadCount": 0,
      "isArchived": false,
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify friendId user exists
- ✅ Check if conversation already exists
- ✅ If yes: Return existing conversation
- ✅ If no: Create new conversation with both participants
- ✅ Get last message in conversation
- ✅ Count unread messages for current user
- ✅ Return conversation with full details

---

### 2. Get All User Conversations
**Endpoint:** `GET /api/v1/conversations`

**Authentication:** ✅ Required (JWT)

**Query Parameters:**
- `limit` (number, optional): Results limit (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversations fetched",
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "otherUser": {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://cloudinary-url.com/avatar.jpg",
          "status": "online"
        },
        "lastMessage": {
          "content": "Hello!",
          "sender": "John Doe",
          "createdAt": "2025-12-21T10:00:00Z"
        },
        "unreadCount": 2,
        "isArchived": false,
        "updatedAt": "2025-12-21T10:00:00Z"
      }
    ],
    "total": 15,
    "limit": 50,
    "offset": 0
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Query all conversations where user is participant
- ✅ For each conversation:
  - ✅ Get the other user's details
  - ✅ Get last message
  - ✅ Count unread messages for current user
  - ✅ Get isArchived status
- ✅ Sort by most recent (by last message or last activity)
- ✅ Apply pagination
- ✅ Return conversations list

---

### 3. Get Single Conversation
**Endpoint:** `GET /api/v1/conversations/:conversationId`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `conversationId` (string, required): Conversation ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation fetched",
  "data": {
    "conversation": {
      "id": "uuid",
      "participants": [
        {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://cloudinary-url.com/avatar.jpg",
          "status": "online"
        }
      ],
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant in conversation
- ✅ Query conversation from database
- ✅ Populate participants
- ✅ Return conversation

---

### 4. Get Other User in Conversation
**Endpoint:** `GET /api/v1/conversations/:conversationId/user`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `conversationId` (string, required): Conversation ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Other user fetched",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://cloudinary-url.com/avatar.jpg",
      "status": "online",
      "bio": "Hello!"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant in conversation
- ✅ Get the other participant (not the current user)
- ✅ Return other user details

---

### 5. Archive Conversation
**Endpoint:** `PATCH /api/v1/conversations/archive`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "conversationId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation archived",
  "data": {
    "conversation": {
      "id": "uuid",
      "isArchived": true
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant
- ✅ Update conversation: `isArchived: true`
- ✅ Emit Socket.IO event: `conversationArchived`
- ✅ Return updated conversation

---

### 6. Unarchive Conversation
**Endpoint:** `PATCH /api/v1/conversations/unarchive`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "conversationId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation unarchived",
  "data": {
    "conversation": {
      "id": "uuid",
      "isArchived": false
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant
- ✅ Update conversation: `isArchived: false`
- ✅ Emit Socket.IO event: `conversationUnarchived`
- ✅ Return updated conversation

---

### 7. Delete Conversation
**Endpoint:** `DELETE /api/v1/conversations`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "conversationId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation deleted"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant
- ✅ Delete all messages in conversation
- ✅ Delete conversation record
- ✅ Emit Socket.IO event: `conversationDeleted`
- ✅ Return success message

---

## Message APIs

### Base URL
```
POST   /api/v1/messages
GET    /api/v1/messages
PATCH  /api/v1/messages
DELETE /api/v1/messages
```

### 1. Send Message
**Endpoint:** `POST /api/v1/messages`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "conversationId": "uuid",
  "content": "Hello, how are you?"
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": "uuid",
      "conversationId": "uuid",
      "content": "Hello, how are you?",
      "sender": {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "https://cloudinary-url.com/avatar.jpg"
      },
      "isRead": false,
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Message content cannot be empty"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant in conversation
- ✅ Validate message content (not empty, max length)
- ✅ Create message in database
- ✅ Emit Socket.IO event: `newMessage` to all conversation participants
- ✅ Return created message

---

### 2. Get Messages in Conversation
**Endpoint:** `GET /api/v1/messages/:conversationId`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `conversationId` (string, required): Conversation ID

**Query Parameters:**
- `limit` (number, optional): Results limit (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Messages fetched",
  "data": {
    "messages": [
      {
        "id": "uuid",
        "conversationId": "uuid",
        "content": "Hello!",
        "sender": {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://cloudinary-url.com/avatar.jpg"
        },
        "isRead": true,
        "createdAt": "2025-12-21T10:00:00Z"
      }
    ],
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant in conversation
- ✅ Query messages ordered by creation time (newest first, then reverse for display)
- ✅ Populate sender details
- ✅ Apply pagination
- ✅ Return messages list

---

### 3. Edit Message
**Endpoint:** `PATCH /api/v1/messages/edit`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "messageId": "uuid",
  "content": "Updated message content"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Message edited successfully",
  "data": {
    "message": {
      "id": "uuid",
      "content": "Updated message content",
      "isEdited": true,
      "editedAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**Error Response:** `403 Forbidden`
```json
{
  "success": false,
  "message": "You can only edit your own messages"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is message sender
- ✅ Validate new content (not empty, max length)
- ✅ Update message: `content`, `isEdited: true`, `editedAt: now`
- ✅ Emit Socket.IO event: `messageEdited` to conversation participants
- ✅ Return updated message

---

### 4. Delete Message (Soft Delete)
**Endpoint:** `DELETE /api/v1/messages`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "messageId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is message sender
- ✅ Soft delete: Set `isDeleted: true` and `deletedAt: now`
- ✅ Keep message in database (not permanent delete)
- ✅ Don't return deleted message content in queries
- ✅ Emit Socket.IO event: `messageDeleted`
- ✅ Return success message

---

### 5. Mark Messages as Read
**Endpoint:** `POST /api/v1/messages/mark-as-read`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "conversationId": "uuid",
  "messageIds": ["uuid1", "uuid2"]
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "markedCount": 2
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant in conversation
- ✅ Update messages: `isRead: true`, add user to `readBy` array
- ✅ Emit Socket.IO event: `messagesRead` with messageIds and userId
- ✅ Return count of marked messages

---

### 6. Get Read Receipts
**Endpoint:** `GET /api/v1/messages/:messageId/read-receipts`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `messageId` (string, required): Message ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Read receipts fetched",
  "data": {
    "readBy": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "readAt": "2025-12-21T10:05:00Z"
      }
    ]
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Query message and get readBy array
- ✅ Populate user details (id, name, avatar)
- ✅ Return array of users who read the message with timestamps

---

### 7. React to Message
**Endpoint:** `POST /api/v1/messages/react`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "messageId": "uuid",
  "emoji": "👍"
}
```

**Valid emojis:**
- 👍 (thumbs up)
- ❤️ (heart)
- 😂 (laughing)
- 😮 (surprised)
- 😢 (crying)
- 😡 (angry)
- etc.

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "Reaction added",
  "data": {
    "reaction": {
      "id": "uuid",
      "messageId": "uuid",
      "userId": "uuid",
      "emoji": "👍",
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify message exists and user is in conversation
- ✅ Check if user already reacted with same emoji
- ✅ If yes: Update existing reaction
- ✅ If no: Create new reaction
- ✅ Emit Socket.IO event: `messageReaction` to conversation participants
- ✅ Return reaction

---

### 8. Remove Reaction
**Endpoint:** `DELETE /api/v1/messages/react`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "reactionId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Reaction removed"
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user added the reaction
- ✅ Delete reaction from database
- ✅ Emit Socket.IO event: `reactionRemoved`
- ✅ Return success message

---

### 9. Get Reactions for Message
**Endpoint:** `GET /api/v1/messages/:messageId/reactions`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `messageId` (string, required): Message ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Reactions fetched",
  "data": {
    "reactions": [
      {
        "emoji": "👍",
        "count": 3,
        "users": [
          {
            "id": "uuid1",
            "name": "John Doe"
          },
          {
            "id": "uuid2",
            "name": "Jane Smith"
          }
        ],
        "userReacted": true
      }
    ]
  }
}
```

**What Backend Needs to Do:**
- ✅ Query all reactions for message
- ✅ Group by emoji
- ✅ Count reactions per emoji
- ✅ Get list of users for each emoji
- ✅ Mark if current user reacted with that emoji
- ✅ Return grouped reactions

---

### 10. Search Messages
**Endpoint:** `GET /api/v1/messages/search?query=hello&conversationId=uuid`

**Authentication:** ✅ Required (JWT)

**Query Parameters:**
- `query` (string, required): Search query
- `conversationId` (string, required): Conversation ID
- `limit` (number, optional): Results limit (default: 20)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Messages found",
  "data": {
    "messages": [
      {
        "id": "uuid",
        "conversationId": "uuid",
        "content": "Hello, how are you?",
        "sender": {
          "id": "uuid",
          "name": "John Doe"
        },
        "createdAt": "2025-12-21T10:00:00Z"
      }
    ]
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is in conversation
- ✅ Search messages by content (case-insensitive)
- ✅ Filter by conversationId
- ✅ Exclude deleted messages
- ✅ Limit results
- ✅ Return matching messages with pagination

---

## Call APIs

### Base URL
```
POST   /api/v1/calls
GET    /api/v1/calls
PATCH  /api/v1/calls
```

### 1. Initiate Call
**Endpoint:** `POST /api/v1/calls`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "conversationId": "uuid",
  "callType": "video"
}
```

**Valid call types:**
- `"video"`
- `"audio"`

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "Call initiated",
  "data": {
    "call": {
      "id": "uuid",
      "conversationId": "uuid",
      "initiatorId": "uuid",
      "recipientId": "uuid",
      "callType": "video",
      "status": "ringing",
      "startTime": "2025-12-21T10:00:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify conversation exists and user is participant
- ✅ Check if already active call in this conversation
- ✅ Create call record in database
- ✅ Set status: "ringing"
- ✅ Get recipient (other user in conversation)
- ✅ Emit Socket.IO event: `incomingCall` to recipient with:
  - callId, callType, initiatorDetails
- ✅ Return call object

---

### 2. Update Call Status
**Endpoint:** `PATCH /api/v1/calls/status`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "callId": "uuid",
  "status": "active"
}
```

**Valid status values:**
- `"active"` - Call accepted and connected
- `"on-hold"` - Call paused
- `"resumed"` - Call resumed from hold

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Call status updated",
  "data": {
    "call": {
      "id": "uuid",
      "status": "active",
      "updatedAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant in call
- ✅ Update call status
- ✅ Emit Socket.IO event: `callStatusChanged` to both participants
- ✅ Return updated call

---

### 3. End Call
**Endpoint:** `PATCH /api/v1/calls/end`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "callId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Call ended",
  "data": {
    "call": {
      "id": "uuid",
      "status": "ended",
      "duration": 120,
      "endTime": "2025-12-21T10:02:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is participant
- ✅ Update call: `status: "ended"`, `endTime: now`
- ✅ Calculate duration from startTime to endTime
- ✅ Save call to history
- ✅ Emit Socket.IO event: `callEnded` to both participants
- ✅ Return updated call with duration

---

### 4. Decline Call
**Endpoint:** `PATCH /api/v1/calls/decline`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "callId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Call declined",
  "data": {
    "call": {
      "id": "uuid",
      "status": "declined",
      "declinedAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is recipient
- ✅ Update call: `status: "declined"`, `declinedAt: now`
- ✅ Emit Socket.IO event: `callDeclined` to initiator
- ✅ Return updated call

---

### 5. Miss Call
**Endpoint:** `PATCH /api/v1/calls/miss`

**Authentication:** ✅ Required (JWT)

**Request Body:**
```json
{
  "callId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Call marked as missed",
  "data": {
    "call": {
      "id": "uuid",
      "status": "missed",
      "missedAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is recipient
- ✅ Update call: `status: "missed"`, `missedAt: now`
- ✅ Emit Socket.IO event: `callMissed` to initiator
- ✅ Return updated call

---

### 6. Get Active Call in Conversation
**Endpoint:** `GET /api/v1/calls/:conversationId`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `conversationId` (string, required): Conversation ID

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Call fetched",
  "data": {
    "call": {
      "id": "uuid",
      "conversationId": "uuid",
      "initiator": {
        "id": "uuid",
        "name": "John Doe"
      },
      "recipient": {
        "id": "uuid",
        "name": "Jane Smith"
      },
      "callType": "video",
      "status": "active",
      "startTime": "2025-12-21T10:00:00Z"
    }
  }
}
```

**Success Response (No active call):** `200 OK`
```json
{
  "success": true,
  "message": "No active call",
  "data": {
    "call": null
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is in conversation
- ✅ Query active call in conversation (status != "ended", "declined", "missed")
- ✅ Populate initiator and recipient details
- ✅ Return call or null if no active call

---

### 7. Get Call History
**Endpoint:** `GET /api/v1/calls/:conversationId/history`

**Authentication:** ✅ Required (JWT)

**URL Parameters:**
- `conversationId` (string, required): Conversation ID

**Query Parameters:**
- `limit` (number, optional): Results limit (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Call history fetched",
  "data": {
    "calls": [
      {
        "id": "uuid",
        "initiator": {
          "id": "uuid",
          "name": "John Doe"
        },
        "recipient": {
          "id": "uuid",
          "name": "Jane Smith"
        },
        "callType": "video",
        "status": "ended",
        "duration": 300,
        "startTime": "2025-12-21T10:00:00Z",
        "endTime": "2025-12-21T10:05:00Z"
      }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

**What Backend Needs to Do:**
- ✅ Extract user ID from JWT
- ✅ Verify user is in conversation
- ✅ Query all calls in conversation (completed calls)
- ✅ Populate initiator and recipient
- ✅ Sort by date (newest first)
- ✅ Apply pagination
- ✅ Return call history

---

## Google OAuth APIs

### Base URL
```
GET /api/v1/auth/google
GET /api/v1/auth/google/callback
```

### 1. Initiate Google OAuth
**Endpoint:** `GET /api/v1/auth/google`

**Authentication:** ❌ None (Public)

**What it does:**
1. Redirects user to Google login page
2. User logs in with Google account
3. User grants permissions for email and profile
4. Google redirects back to `/api/v1/auth/google/callback`

**Frontend Implementation:**
```javascript
// Redirect to this URL when user clicks "Sign in with Google"
window.location.href = "${API_URL}/auth/google"
```

**What Backend Needs to Do:**
- ✅ Configure Passport.js GoogleStrategy
- ✅ Set Google OAuth client ID and secret
- ✅ Set callback URL to `/api/v1/auth/google/callback`
- ✅ Request scopes: `email`, `profile`
- ✅ Redirect user to Google login

---

### 2. Google OAuth Callback
**Endpoint:** `GET /api/v1/auth/google/callback?code=<authorization_code>`

**Authentication:** ❌ None (Automatic via Passport)

**Process:**
1. Google redirects here with authorization code
2. Backend exchanges code for user profile
3. Backend finds or creates user
4. Backend generates JWT tokens
5. Backend redirects to frontend with tokens in URL

**Success Redirect:** 
```
${FRONTEND_URL}/auth/google-callback?token=<access_token>&user=<encoded_user_json>
```

**URL Parameters Passed to Frontend:**
- `token` (string): Access JWT token
- `user` (string): URL-encoded JSON object with:
  ```json
  {
    "id": "uuid",
    "email": "user@gmail.com",
    "name": "User Name",
    "avatar": "https://google-avatar-url.jpg",
    "role": "USER"
  }
  ```

**Error Redirect:**
```
${FRONTEND_URL}/auth/google-callback?error=access_denied
```

**What Backend Needs to Do:**
- ✅ Extract authorization code from query params
- ✅ Exchange code for user profile via Google API
- ✅ Extract user info: id, email, name, picture
- ✅ Check if user exists in database
- ✅ If exists: Return existing user
- ✅ If not exists: Create new user with:
  - ✅ Email from Google
  - ✅ Name from Google
  - ✅ Avatar from Google picture
  - ✅ `emailVerified: true` (since it's from Google)
  - ✅ Random password (user can set later)
- ✅ Generate access token (30 min JWT)
- ✅ Generate refresh token (7 day JWT)
- ✅ URL-encode user JSON
- ✅ Redirect to: `${FRONTEND_URL}/auth/google-callback?token=<token>&user=<encoded_user>`

---

## Common Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data varies by endpoint
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PATCH/DELETE |
| 201 | Created | Successful POST creating resource |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | Missing/invalid token, not authenticated |
| 403 | Forbidden | User not authorized to perform action |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

### Common Error Messages

```json
{
  "success": false,
  "message": "Email already registered"
}
```

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

```json
{
  "success": false,
  "message": "You can only edit your own messages"
}
```

---

## Database Models Required

### User Model
```typescript
{
  id: UUID,
  name: string,
  email: string (unique),
  password: string (hashed),
  avatar: string (URL),
  bio: string,
  role: "USER" | "ADMIN",
  status: "online" | "offline" | "away",
  emailVerified: boolean,
  verificationToken?: string,
  verificationTokenExpiry?: Date,
  passwordResetToken?: string,
  passwordResetTokenExpiry?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Friendship Model
```typescript
{
  id: UUID,
  user1Id: UUID (ref: User),
  user2Id: UUID (ref: User),
  createdAt: Date
}
```

### Friend Request Model
```typescript
{
  id: UUID,
  senderId: UUID (ref: User),
  recipientId: UUID (ref: User),
  status: "pending" | "accepted" | "rejected",
  createdAt: Date
}
```

### Conversation Model
```typescript
{
  id: UUID,
  participants: UUID[] (ref: User),
  isArchived: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```typescript
{
  id: UUID,
  conversationId: UUID (ref: Conversation),
  senderId: UUID (ref: User),
  content: string,
  isRead: boolean,
  readBy: { userId: UUID, readAt: Date }[],
  isEdited: boolean,
  editedAt?: Date,
  isDeleted: boolean,
  deletedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Reaction Model
```typescript
{
  id: UUID,
  messageId: UUID (ref: Message),
  userId: UUID (ref: User),
  emoji: string,
  createdAt: Date
}
```

### Call Model
```typescript
{
  id: UUID,
  conversationId: UUID (ref: Conversation),
  initiatorId: UUID (ref: User),
  recipientId: UUID (ref: User),
  callType: "video" | "audio",
  status: "ringing" | "active" | "on-hold" | "ended" | "declined" | "missed",
  startTime: Date,
  endTime?: Date,
  duration?: number (seconds),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Socket.IO Events Reference

### Real-time Events to Emit

**User Status:**
- `userStatusChanged` - When user status changes (online/offline/away)

**Friends:**
- `friendRequestReceived` - When someone sends friend request
- `friendAdded` - When friend request accepted
- `friendRequestRejected` - When friend request rejected
- `friendRequestCancelled` - When friend request cancelled
- `friendRemoved` - When someone is removed from friends

**Conversations:**
- `conversationArchived` - When conversation is archived
- `conversationUnarchived` - When conversation is unarchived
- `conversationDeleted` - When conversation is deleted

**Messages:**
- `newMessage` - When new message is sent
- `messageEdited` - When message is edited
- `messageDeleted` - When message is deleted
- `messagesRead` - When messages are marked as read
- `messageReaction` - When reaction is added to message
- `reactionRemoved` - When reaction is removed

**Calls:**
- `incomingCall` - When call is initiated
- `callStatusChanged` - When call status changes
- `callEnded` - When call ends
- `callDeclined` - When call is declined
- `callMissed` - When call is missed

---

## Implementation Checklist

For each API endpoint, verify:
- ✅ Input validation (Zod schemas)
- ✅ Authentication check (JWT)
- ✅ Authorization check (user permission)
- ✅ Database query with error handling
- ✅ Response formatting (success/error)
- ✅ HTTP status code correct
- ✅ Socket.IO events emitted
- ✅ Error messages user-friendly
- ✅ Async/await properly handled
- ✅ Database transactions where needed

