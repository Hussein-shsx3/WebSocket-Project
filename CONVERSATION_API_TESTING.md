# Conversation API - Complete Testing Guide

## Server Status
✅ Server running on: `http://localhost:5000`
✅ Database: PostgreSQL (websocket_project)
✅ Socket.io: Connected

---

## Step 1: Create Test Users (If Needed)

First, register 2 users via the auth endpoints:

**Endpoint:** `POST http://localhost:5000/api/v1/auth/register`

**Body for User 1:**
```json
{
  "email": "alice@example.com",
  "password": "Password123!",
  "name": "Alice"
}
```

**Save the response token as `TOKEN_ALICE`**

---

**Body for User 2:**
```json
{
  "email": "bob@example.com",
  "password": "Password123!",
  "name": "Bob"
}
```

**Save the response token as `TOKEN_BOB`**

---

## Step 2: Make Them Friends

**Endpoint:** `POST http://localhost:5000/api/v1/friends/send-request`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer TOKEN_ALICE"
}
```

**Body:**
```json
{
  "recipientEmail": "bob@example.com"
}
```

---

Then Bob accepts the friend request:

**Endpoint:** `POST http://localhost:5000/api/v1/friends/accept-request`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer TOKEN_BOB"
}
```

**Body:**
```json
{
  "requesterId": "alice-user-id"
}
```

**Get alice-user-id from the friend request response**

---

## Step 3: Test Conversation Endpoints

### Test 1: Create Conversation

**Endpoint:** `POST http://localhost:5000/api/v1/conversations`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer TOKEN_ALICE"
}
```

**Body:**
```json
{
  "friendId": "bob-user-id"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Conversation retrieved or created",
  "data": {
    "id": "conv-123",
    "participants": [
      {
        "id": "alice-id",
        "name": "Alice",
        "email": "alice@example.com"
      },
      {
        "id": "bob-id",
        "name": "Bob",
        "email": "bob@example.com"
      }
    ],
    "lastMessageAt": null,
    "isArchived": false,
    "createdAt": "2024-12-13T11:00:00Z"
  }
}
```

**Save `conversation_id` from response**

---

### Test 2: List All Conversations

**Endpoint:** `GET http://localhost:5000/api/v1/conversations`

**Headers:**
```json
{
  "Authorization": "Bearer TOKEN_ALICE"
}
```

**Query Parameters (optional):**
```
?limit=10&page=1&search=Bob
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Conversations retrieved",
  "data": [
    {
      "id": "conv-123",
      "otherUser": {
        "id": "bob-id",
        "name": "Bob",
        "email": "bob@example.com"
      },
      "lastMessage": null,
      "lastMessageAt": null,
      "isArchived": false,
      "unreadCount": 0
    }
  ]
}
```

---

### Test 3: Get Single Conversation (Auto-Mark as Read)

**Endpoint:** `GET http://localhost:5000/api/v1/conversations/{{conversation_id}}`

**Headers:**
```json
{
  "Authorization": "Bearer TOKEN_ALICE"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Conversation retrieved",
  "data": {
    "id": "conv-123",
    "otherUser": {
      "id": "bob-id",
      "name": "Bob",
      "email": "bob@example.com"
    },
    "messages": [],
    "isArchived": false,
    "createdAt": "2024-12-13T11:00:00Z"
  }
}
```

⚠️ **Note:** All unread messages are automatically marked as read when this endpoint is called!

---

### Test 4: Get Other User in Conversation

**Endpoint:** `GET http://localhost:5000/api/v1/conversations/{{conversation_id}}/user`

**Headers:**
```json
{
  "Authorization": "Bearer TOKEN_ALICE"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Other user retrieved",
  "data": {
    "id": "bob-id",
    "name": "Bob",
    "email": "bob@example.com",
    "avatar": null,
    "status": "offline",
    "lastSeenAt": null
  }
}
```

---

### Test 5: Send Message via Socket.io

Use Postman's WebSocket feature:

1. Open **WebSocket** request
2. **URL:** `ws://localhost:5000`
3. **Connect with auth:**
```javascript
// On Connect, send:
{
  "auth": {
    "token": "TOKEN_ALICE",
    "userId": "alice-id"
  }
}
```

4. **Send message event:**
```json
{
  "event": "message:send",
  "data": {
    "conversationId": "{{conversation_id}}",
    "content": "Hey Bob! How are you?",
    "type": "TEXT"
  }
}
```

5. **Listen for responses:**
```json
{
  "event": "message:received",
  "data": {...}
}
```

---

### Test 6: Archive Conversation

**Endpoint:** `PATCH http://localhost:5000/api/v1/conversations/archive`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer TOKEN_ALICE"
}
```

**Body:**
```json
{
  "conversationId": "{{conversation_id}}"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Conversation archived",
  "data": {
    "id": "conv-123",
    "isArchived": true
  }
}
```

---

### Test 7: Unarchive Conversation

**Endpoint:** `PATCH http://localhost:5000/api/v1/conversations/unarchive`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer TOKEN_ALICE"
}
```

**Body:**
```json
{
  "conversationId": "{{conversation_id}}"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Conversation unarchived",
  "data": {
    "id": "conv-123",
    "isArchived": false
  }
}
```

---

### Test 8: Delete Conversation

**Endpoint:** `DELETE http://localhost:5000/api/v1/conversations`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer TOKEN_ALICE"
}
```

**Body:**
```json
{
  "conversationId": "{{conversation_id}}"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

## Postman Environment Variables

Create a Postman environment with these variables:

```json
{
  "TOKEN_ALICE": "your-alice-token",
  "TOKEN_BOB": "your-bob-token",
  "ALICE_ID": "alice-user-id",
  "BOB_ID": "bob-user-id",
  "CONVERSATION_ID": "conv-123",
  "BASE_URL": "http://localhost:5000/api/v1"
}
```

Then use in requests like: `{{BASE_URL}}/conversations/{{CONVERSATION_ID}}`

---

## Full Testing Workflow

1. ✅ Register User 1 (Alice) - Save token
2. ✅ Register User 2 (Bob) - Save token
3. ✅ Send friend request (Alice → Bob)
4. ✅ Accept friend request (Bob)
5. ✅ Create conversation (Alice)
6. ✅ List conversations (Alice)
7. ✅ Get single conversation (Auto-mark as read)
8. ✅ Get other user
9. ✅ Send message via Socket.io
10. ✅ Archive conversation
11. ✅ Unarchive conversation
12. ✅ Delete conversation

---

## Socket.io Real-Time Events

### Available Events

```
✅ conversation:open
✅ conversation:close
✅ message:send
✅ message:received
✅ typing:start
✅ typing:stop
✅ user:status
```

### Example: Full Real-Time Chat Flow

```javascript
// 1. Alice connects and opens conversation
socket.emit("conversation:open", "conv-123");

// 2. Alice receives existing messages (auto-marked as read)
socket.on("messages:read", (data) => {
  console.log("All messages marked as read by Alice");
});

// 3. Bob sends a message
socket.emit("message:send", {
  conversationId: "conv-123",
  content: "Hi Alice!",
  type: "TEXT"
});

// 4. Alice receives message instantly
socket.on("message:received", (message) => {
  console.log("Received:", message);
  // ✅ Auto-marked as read since Alice is in the conversation room
});

// 5. Bob sees read receipt
socket.on("message:read", (data) => {
  console.log("Alice read your message ✅");
});

// 6. Alice closes conversation
socket.emit("conversation:close", "conv-123");
```

---

## Error Responses

### 400 Bad Request - Cannot message yourself
```json
{
  "success": false,
  "message": "Cannot start conversation with yourself"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Conversation not found"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to access this conversation"
}
```

---

## Testing Checklist

- [ ] User registration works
- [ ] Friend requests working
- [ ] Create conversation ✅
- [ ] List conversations ✅
- [ ] Get single conversation (auto-mark) ✅
- [ ] Get other user ✅
- [ ] Archive conversation ✅
- [ ] Unarchive conversation ✅
- [ ] Delete conversation ✅
- [ ] Socket.io message sending
- [ ] Socket.io auto-mark on receive
- [ ] Socket.io typing indicators
- [ ] Socket.io online/offline status

---

## Tips

🔒 **Authentication:** Always include Authorization header with Bearer token
📍 **Conversation ID:** Available from POST /conversations response or GET /conversations list
👥 **User IDs:** Available from login response or friend list
⏱️ **Real-time:** Socket.io connection automatically marks messages as read
🔄 **Refresh:** After archiving, list conversations to see changes

