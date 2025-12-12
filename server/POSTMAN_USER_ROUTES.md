# User API - Postman Testing Guide

## Prerequisites
1. **Access token** from login
2. **Base URL**: `http://localhost:5000`

---

## Setup: Login First

### Login to Get Access Token
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "Password123!"
}
```

**Save the `accessToken` as `USER_TOKEN`**
**Save the user `id` as `USER_ID`**

---

## User Endpoints

### 1️⃣ Get Current User's Profile

```http
GET http://localhost:5000/api/v1/users/profile
Authorization: Bearer {{USER_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "user-id-123",
    "name": "Alice",
    "email": "alice@example.com",
    "avatar": null,
    "bio": null,
    "status": "offline",
    "emailVerified": true,
    "role": "USER",
    "createdAt": "2025-12-12T10:00:00Z"
  }
}
```

---

### 2️⃣ Update User Profile

```http
PATCH http://localhost:5000/api/v1/users/profile
Authorization: Bearer {{USER_TOKEN}}
Content-Type: application/json

{
  "name": "Alice Updated",
  "bio": "Full Stack Developer"
}
```

**Optional Fields:**
- `name` - Update display name
- `bio` - Update bio/description
- `status` - Update status (online, offline, away)

**Expected Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user-id-123",
    "name": "Alice Updated",
    "email": "alice@example.com",
    "avatar": null,
    "bio": "Full Stack Developer",
    "status": "offline",
    "emailVerified": true,
    "role": "USER",
    "createdAt": "2025-12-12T10:00:00Z",
    "updatedAt": "2025-12-12T10:05:00Z"
  }
}
```

---

### 3️⃣ Upload User Avatar

```http
POST http://localhost:5000/api/v1/users/avatar
Authorization: Bearer {{USER_TOKEN}}
Content-Type: multipart/form-data

[Select image file as "avatar" field]
```

**In Postman:**
1. Set method to `POST`
2. Go to **Body** tab
3. Select **form-data**
4. Add key: `avatar` (type: **File**)
5. Select an image file
6. Send

**Expected Response (200):**
```json
{
  "message": "Avatar uploaded successfully",
  "user": {
    "id": "user-id-123",
    "name": "Alice",
    "email": "alice@example.com",
    "avatar": "https://cloudinary.com/image-url.jpg",
    "bio": "Full Stack Developer",
    "status": "offline",
    "emailVerified": true,
    "role": "USER",
    "createdAt": "2025-12-12T10:00:00Z",
    "updatedAt": "2025-12-12T10:10:00Z"
  }
}
```

---

### 4️⃣ Update User Status

```http
PATCH http://localhost:5000/api/v1/users/status
Authorization: Bearer {{USER_TOKEN}}
Content-Type: application/json

{
  "status": "online"
}
```

**Valid Status Values:**
- `online`
- `offline`
- `away`

**Expected Response (200):**
```json
{
  "message": "Status updated successfully",
  "user": {
    "id": "user-id-123",
    "name": "Alice",
    "email": "alice@example.com",
    "avatar": null,
    "bio": "Full Stack Developer",
    "status": "online",
    "emailVerified": true,
    "role": "USER",
    "createdAt": "2025-12-12T10:00:00Z",
    "updatedAt": "2025-12-12T10:15:00Z"
  }
}
```

---

### 5️⃣ Get User By ID (Public Profile)

```http
GET http://localhost:5000/api/v1/users/{{USER_ID}}
Authorization: Bearer {{USER_TOKEN}}
```

**Note:** You can view any user's public profile with their ID

**Expected Response (200):**
```json
{
  "message": "User retrieved successfully",
  "user": {
    "id": "user-id-123",
    "name": "Alice",
    "email": "alice@example.com",
    "avatar": null,
    "bio": "Full Stack Developer",
    "status": "online",
    "emailVerified": true,
    "role": "USER",
    "createdAt": "2025-12-12T10:00:00Z"
  }
}
```

---

### 6️⃣ Search Users

```http
GET http://localhost:5000/api/v1/users/search?query=alice&limit=10
Authorization: Bearer {{USER_TOKEN}}
```

**Query Parameters:**
- `query` - Search term (name or email)
- `limit` (optional) - Maximum results (default: 10)

**Expected Response (200):**
```json
{
  "message": "Users found successfully",
  "data": {
    "users": [
      {
        "id": "user-id-123",
        "name": "Alice",
        "email": "alice@example.com",
        "avatar": null,
        "bio": "Full Stack Developer",
        "status": "online"
      }
    ],
    "count": 1
  }
}
```

---

### 7️⃣ Get All Users (Admin Only)

```http
GET http://localhost:5000/api/v1/users/admin/all?page=1&limit=10
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Note:** Only users with ADMIN role can access this endpoint

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Expected Response (200):**
```json
{
  "message": "All users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user-id-123",
        "name": "Alice",
        "email": "alice@example.com",
        "avatar": null,
        "bio": "Full Stack Developer",
        "role": "USER",
        "status": "online",
        "emailVerified": true,
        "createdAt": "2025-12-12T10:00:00Z"
      },
      {
        "id": "user-id-456",
        "name": "Bob",
        "email": "bob@example.com",
        "avatar": null,
        "bio": null,
        "role": "USER",
        "status": "offline",
        "emailVerified": true,
        "createdAt": "2025-12-12T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 8️⃣ Delete User Account

```http
DELETE http://localhost:5000/api/v1/users/profile
Authorization: Bearer {{USER_TOKEN}}
```

**Warning:** This permanently deletes the user account and all related data!

**Expected Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

**Note:** After deletion, the token will no longer be valid. User must register again.

---

## Error Cases to Test

### 1. Update Profile with Invalid Data
```http
PATCH http://localhost:5000/api/v1/users/profile
Authorization: Bearer {{USER_TOKEN}}
Content-Type: application/json

{
  "name": "",
  "bio": 12345
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": {
    "name": ["Name must be a non-empty string"],
    "bio": ["Bio must be a string"]
  }
}
```

---

### 2. Update Status with Invalid Value
```http
PATCH http://localhost:5000/api/v1/users/status
Authorization: Bearer {{USER_TOKEN}}
Content-Type: application/json

{
  "status": "invisible"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": {
    "status": ["Status must be one of: online, offline, away"]
  }
}
```

---

### 3. Get User with Invalid ID
```http
GET http://localhost:5000/api/v1/users/invalid-user-id
Authorization: Bearer {{USER_TOKEN}}
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

---

### 4. Search with Empty Query
```http
GET http://localhost:5000/api/v1/users/search?query=&limit=10
Authorization: Bearer {{USER_TOKEN}}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": {
    "query": ["Search query is required"]
  }
}
```

---

### 5. Access Admin Endpoint Without Admin Role
```http
GET http://localhost:5000/api/v1/users/admin/all
Authorization: Bearer {{USER_TOKEN}}
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Access denied",
  "statusCode": 403
}
```

---

### 6. Upload Avatar Without File
```http
POST http://localhost:5000/api/v1/users/avatar
Authorization: Bearer {{USER_TOKEN}}
Content-Type: multipart/form-data

[No file selected]
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "File upload error: No file selected",
  "statusCode": 400
}
```

---

### 7. Missing Authorization Header
```http
GET http://localhost:5000/api/v1/users/profile
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Authentication failed",
  "statusCode": 401
}
```

---

## Postman Collection Variables

Set these in your Postman environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `USER_TOKEN` | User's access token | `eyJhbGc...` |
| `ADMIN_TOKEN` | Admin's access token | `eyJhbGc...` |
| `USER_ID` | User's ID | `cm123abc` |

---

## Quick Test Checklist

- [ ] ✅ Get current user profile
- [ ] ✅ Update profile (name, bio)
- [ ] ✅ Upload avatar
- [ ] ✅ Update status (online/offline/away)
- [ ] ✅ Get user by ID
- [ ] ✅ Search users
- [ ] ✅ Get all users (admin)
- [ ] ✅ Delete account
- [ ] ✅ Error: Invalid profile data
- [ ] ✅ Error: Invalid status value
- [ ] ✅ Error: User not found
- [ ] ✅ Error: Empty search query
- [ ] ✅ Error: No admin role
- [ ] ✅ Error: No file for avatar
- [ ] ✅ Error: Missing auth header

---

## Summary

**Total Endpoints: 8**

1. `GET /api/v1/users/profile` - Get current user profile
2. `PATCH /api/v1/users/profile` - Update profile
3. `POST /api/v1/users/avatar` - Upload avatar
4. `PATCH /api/v1/users/status` - Update status
5. `GET /api/v1/users/:id` - Get public user profile
6. `GET /api/v1/users/search` - Search users
7. `GET /api/v1/users/admin/all` - Get all users (admin)
8. `DELETE /api/v1/users/profile` - Delete account

**Happy Testing!** 🚀
