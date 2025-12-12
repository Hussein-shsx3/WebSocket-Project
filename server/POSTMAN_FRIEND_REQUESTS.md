# Friend Request System - Postman Testing Guide

## Prerequisites
1. **Two user accounts** (to test friend requests between users)
2. **Access tokens** for both users
3. **Base URL**: `http://localhost:5000`

---

## Setup: Create Two Test Users

### User 1 - Register
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "Password123!"
}
```

### User 2 - Register
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Bob",
  "email": "bob@example.com",
  "password": "Password123!"
}
```

### Login as User 1 (Alice)
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "Password123!"
}
```
**Save the `accessToken` as `ALICE_TOKEN`**

### Login as User 2 (Bob)
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "bob@example.com",
  "password": "Password123!"
}
```
**Save the `accessToken` as `BOB_TOKEN`**
**Save Bob's `id` from response as `BOB_ID`**

---

## Test Flow

### 1️⃣ Send Friend Request (Alice → Bob)

```http
POST http://localhost:5000/api/v1/friends/request
Authorization: Bearer {{ALICE_TOKEN}}
Content-Type: application/json

{
  "receiverId": "{{BOB_ID}}"
}
```

**Expected Response (201):**
```json
{
  "message": "Friend request sent successfully",
  "data": {
    "id": "request-id-123",
    "senderId": "alice-id",
    "receiverId": "bob-id",
    "status": "PENDING",
    "createdAt": "2025-12-12T10:00:00Z",
    "sender": {
      "id": "alice-id",
      "name": "Alice",
      "email": "alice@example.com",
      "avatar": null
    },
    "receiver": {
      "id": "bob-id",
      "name": "Bob",
      "email": "bob@example.com",
      "avatar": null
    }
  }
}
```

**Save the `request-id-123` as `REQUEST_ID`**

---

### 2️⃣ Get Pending Requests (Bob's perspective - received)

```http
GET http://localhost:5000/api/v1/friends/requests?type=pending&page=1&limit=10
Authorization: Bearer {{BOB_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Pending friend requests retrieved successfully",
  "data": {
    "requests": [
      {
        "id": "request-id-123",
        "senderId": "alice-id",
        "receiverId": "bob-id",
        "status": "PENDING",
        "createdAt": "2025-12-12T10:00:00Z",
        "sender": {
          "id": "alice-id",
          "name": "Alice",
          "email": "alice@example.com",
          "avatar": null,
          "bio": null
        }
      }
    ],
    "type": "pending",
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 3️⃣ Get Sent Requests (Alice's perspective - sent)

```http
GET http://localhost:5000/api/v1/friends/requests?type=sent&page=1&limit=10
Authorization: Bearer {{ALICE_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Sent friend requests retrieved successfully",
  "data": {
    "requests": [
      {
        "id": "request-id-123",
        "senderId": "alice-id",
        "receiverId": "bob-id",
        "status": "PENDING",
        "createdAt": "2025-12-12T10:00:00Z",
        "receiver": {
          "id": "bob-id",
          "name": "Bob",
          "email": "bob@example.com",
          "avatar": null,
          "bio": null
        }
      }
    ],
    "type": "sent",
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 4️⃣ Accept Friend Request (Bob accepts)

```http
PATCH http://localhost:5000/api/v1/friends/request/{{REQUEST_ID}}/accept
Authorization: Bearer {{BOB_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Friend request accepted successfully",
  "data": {
    "request": {
      "id": "request-id-123",
      "senderId": "alice-id",
      "receiverId": "bob-id",
      "status": "ACCEPTED",
      "createdAt": "2025-12-12T10:00:00Z",
      "updatedAt": "2025-12-12T10:05:00Z"
    },
    "friendship": {
      "id": "friendship-id-456",
      "userId": "alice-id",
      "friendId": "bob-id",
      "createdAt": "2025-12-12T10:05:00Z"
    }
  }
}
```

---

### 5️⃣ Get Friends List (Alice's perspective)

```http
GET http://localhost:5000/api/v1/friends?page=1&limit=10
Authorization: Bearer {{ALICE_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Friends retrieved successfully",
  "data": {
    "friends": [
      {
        "id": "bob-id",
        "name": "Bob",
        "email": "bob@example.com",
        "avatar": null,
        "bio": null,
        "status": "OFFLINE"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 6️⃣ Get Friends List (Bob's perspective)

```http
GET http://localhost:5000/api/v1/friends?page=1&limit=10
Authorization: Bearer {{BOB_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Friends retrieved successfully",
  "data": {
    "friends": [
      {
        "id": "alice-id",
        "name": "Alice",
        "email": "alice@example.com",
        "avatar": null,
        "bio": null,
        "status": "OFFLINE"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 7️⃣ Search Friends

```http
GET http://localhost:5000/api/v1/friends?search=alice&page=1&limit=10
Authorization: Bearer {{BOB_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Friends retrieved successfully",
  "data": {
    "friends": [
      {
        "id": "alice-id",
        "name": "Alice",
        "email": "alice@example.com",
        "avatar": null,
        "bio": null,
        "status": "OFFLINE"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 8️⃣ Remove Friend (Alice removes Bob)

```http
DELETE http://localhost:5000/api/v1/friends/{{BOB_ID}}
Authorization: Bearer {{ALICE_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Friend removed successfully"
}
```

---

## Alternative Test Flow: Reject Friend Request

### Setup: Alice sends request to Bob again

```http
POST http://localhost:5000/api/v1/friends/request
Authorization: Bearer {{ALICE_TOKEN}}
Content-Type: application/json

{
  "receiverId": "{{BOB_ID}}"
}
```

**Save the new `request-id` as `REQUEST_ID`**

### Bob Rejects the Request

```http
PATCH http://localhost:5000/api/v1/friends/request/{{REQUEST_ID}}/reject
Authorization: Bearer {{BOB_TOKEN}}
```

**Note:** No body needed. Backend knows Bob is rejecting based on his token in the Authorization header.

**Expected Response (200):**
```json
{
  "message": "Friend request rejected successfully",
  "data": {
    "id": "request-id-123",
    "senderId": "alice-id",
    "receiverId": "bob-id",
    "status": "REJECTED",
    "createdAt": "2025-12-12T10:00:00Z",
    "updatedAt": "2025-12-12T10:10:00Z"
  }
}
```

---

## Alternative Test Flow: Cancel Friend Request

### Setup: Alice sends request to Bob

```http
POST http://localhost:5000/api/v1/friends/request
Authorization: Bearer {{ALICE_TOKEN}}
Content-Type: application/json

{
  "receiverId": "{{BOB_ID}}"
}
```

**Save the `request-id-123` as `REQUEST_ID`**

### Alice Cancels Her Own Request (removes it from pending)

```http
DELETE http://localhost:5000/api/v1/friends/request/{{REQUEST_ID}}
Authorization: Bearer {{ALICE_TOKEN}}
```

**Note:** Only the sender (Alice) can cancel a request she sent.

**Expected Response (200):**
```json
{
  "message": "Friend request cancelled successfully"
}
```

**What happens:**
- ✅ Request is **deleted** from database
- ✅ Bob no longer sees it in his pending requests
- ✅ Alice can send a new request later if she wants

---

## Error Cases to Test

### 1. Send Request to Self
```http
POST http://localhost:5000/api/v1/friends/request
Authorization: Bearer {{ALICE_TOKEN}}
Content-Type: application/json

{
  "receiverId": "{{ALICE_ID}}"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "You cannot send a friend request to yourself",
  "statusCode": 400
}
```

---

### 2. Send Duplicate Request
```http
POST http://localhost:5000/api/v1/friends/request
Authorization: Bearer {{ALICE_TOKEN}}
Content-Type: application/json

{
  "receiverId": "{{BOB_ID}}"
}
```
*Send twice*

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Friend request already sent",
  "statusCode": 400
}
```

---

### 3. Send Request to Non-existent User
```http
POST http://localhost:5000/api/v1/friends/request
Authorization: Bearer {{ALICE_TOKEN}}
Content-Type: application/json

{
  "receiverId": "invalid-user-id-123"
}
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

### 4. Accept Request Not Sent to You
```http
PATCH http://localhost:5000/api/v1/friends/request/{{REQUEST_ID}}/accept
Authorization: Bearer {{ALICE_TOKEN}}
```
*Alice tries to accept a request sent BY her*

**Expected Response (400):**
```json
{
  "success": false,
  "message": "You can only accept requests sent to you",
  "statusCode": 400
}
```

---

### 5. Cancel Request Not Sent By You
```http
DELETE http://localhost:5000/api/v1/friends/request/{{REQUEST_ID}}
Authorization: Bearer {{BOB_TOKEN}}
```
*Bob tries to cancel a request sent by Alice*

**Expected Response (400):**
```json
{
  "success": false,
  "message": "You can only cancel requests you sent",
  "statusCode": 400
}
```

---

### 6. Remove Friend That Doesn't Exist
```http
DELETE http://localhost:5000/api/v1/friends/invalid-friend-id
Authorization: Bearer {{ALICE_TOKEN}}
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Friendship not found",
  "statusCode": 404
}
```

---

## Postman Collection Variables

Set these in your Postman environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `ALICE_TOKEN` | Alice's access token | `eyJhbGc...` |
| `BOB_TOKEN` | Bob's access token | `eyJhbGc...` |
| `ALICE_ID` | Alice's user ID | `cm123abc` |
| `BOB_ID` | Bob's user ID | `cm456def` |
| `REQUEST_ID` | Friend request ID | `cm789ghi` |

---

## Quick Test Checklist

- [ ] ✅ Send friend request
- [ ] ✅ Get pending requests (receiver)
- [ ] ✅ Get sent requests (sender)
- [ ] ✅ Accept friend request
- [ ] ✅ Get friends list (both users)
- [ ] ✅ Search friends
- [ ] ✅ Remove friend
- [ ] ✅ Reject friend request
- [ ] ✅ Cancel friend request
- [ ] ✅ Error: Send to self
- [ ] ✅ Error: Duplicate request
- [ ] ✅ Error: Non-existent user
- [ ] ✅ Error: Accept wrong request
- [ ] ✅ Error: Cancel wrong request

---

## Summary

**Total Endpoints: 8**

1. `POST /api/v1/friends/request` - Send friend request
2. `PATCH /api/v1/friends/request/:requestId/accept` - Accept request
3. `PATCH /api/v1/friends/request/:requestId/reject` - Reject request
4. `DELETE /api/v1/friends/request/:requestId` - Cancel request
5. `GET /api/v1/friends/requests?type=pending` - Get pending requests
6. `GET /api/v1/friends/requests?type=sent` - Get sent requests
7. `GET /api/v1/friends` - Get friends list
8. `DELETE /api/v1/friends/:friendId` - Remove friend

**Happy Testing!** 🚀
