# Message API Endpoints - Real-Time Testing Guide

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Message Endpoints Overview

### 1. Send Message (Real-Time via Socket.io)

**Socket Event:** `message:send`

**Description:** Send a message in real-time via WebSocket

**Payload:**
```json
{
  "conversationId": "conv-123",
  "content": "Hello! How are you?",
  "type": "TEXT",
  "mediaUrls": []
}
```

**Message Types:**
- `TEXT` - Plain text message
- `IMAGE` - Image message
- `VIDEO` - Video message
- `FILE` - File message
- `SYSTEM_MESSAGE` - System notification

**Backend Response (broadcasts to all in conversation):**
```json
{
  "id": "msg-123",
  "conversationId": "conv-123",
  "senderId": "user-123",
  "content": "Hello! How are you?",
  "type": "TEXT",
  "createdAt": "2024-12-13T10:00:00Z",
  "sender": {
    "id": "user-123",
    "name": "John",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

---

### 2. Receive Message (Real-Time via Socket.io)

**Socket Event:** `message:received`

**Description:** Listen for incoming messages in real-time

**Listen for:**
```javascript
socket.on('message:received', (message) => {
  console.log('New message:', message);
  // Message is automatically marked as read if you're in the conversation room
});
```

**Message Object:**
```json
{
  "id": "msg-123",
  "conversationId": "conv-123",
  "senderId": "friend-456",
  "content": "Hi John!",
  "type": "TEXT",
  "status": "DELIVERED",
  "createdAt": "2024-12-13T10:00:00Z",
  "sender": {
    "id": "friend-456",
    "name": "Jane",
    "avatar": "https://example.com/jane.jpg"
  }
}
```

---

### 3. Mark Messages as Read (HTTP)

**Endpoint:** `POST /messages/mark-as-read`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

**Body:**
```json
{
  "conversationId": "conv-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "conversationId": "conv-123",
    "markedCount": 5,
    "markedAt": "2024-12-13T10:15:00Z"
  }
}
```

---

### 4. Get Message Read Status (HTTP)

**Endpoint:** `GET /messages/:messageId/read-by`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**
```
GET /messages/msg-123/read-by
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message read status retrieved",
  "data": {
    "messageId": "msg-123",
    "readBy": [
      {
        "userId": "friend-456",
        "name": "Jane",
        "readAt": "2024-12-13T10:05:00Z"
      },
      {
        "userId": "friend-789",
        "name": "Bob",
        "readAt": "2024-12-13T10:07:00Z"
      }
    ],
    "totalReads": 2
  }
}
```

---

### 5. Get Messages in Conversation (HTTP)

**Endpoint:** `GET /messages/conversation/:conversationId?limit=50&page=1`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `limit` (optional): Number of messages per page (default: 50)
- `page` (optional): Page number (default: 1)

**Example:**
```
GET /messages/conversation/conv-123?limit=20&page=1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Messages retrieved",
  "data": [
    {
      "id": "msg-1",
      "conversationId": "conv-123",
      "senderId": "user-123",
      "content": "Hi Jane!",
      "type": "TEXT",
      "status": "READ",
      "isEdited": false,
      "createdAt": "2024-12-13T10:00:00Z",
      "updatedAt": "2024-12-13T10:00:00Z",
      "sender": {
        "id": "user-123",
        "name": "John",
        "avatar": "https://example.com/john.jpg"
      },
      "readBy": [
        {
          "userId": "friend-456",
          "readAt": "2024-12-13T10:05:00Z"
        }
      ]
    },
    {
      "id": "msg-2",
      "conversationId": "conv-123",
      "senderId": "friend-456",
      "content": "Hi John! How are you?",
      "type": "TEXT",
      "status": "READ",
      "isEdited": false,
      "createdAt": "2024-12-13T10:01:00Z",
      "updatedAt": "2024-12-13T10:01:00Z",
      "sender": {
        "id": "friend-456",
        "name": "Jane",
        "avatar": "https://example.com/jane.jpg"
      },
      "readBy": [
        {
          "userId": "user-123",
          "readAt": "2024-12-13T10:06:00Z"
        }
      ]
    }
  ]
}
```

---

### 6. Edit Message (HTTP)

**Endpoint:** `PUT /messages/:messageId`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

**Body:**
```json
{
  "content": "Updated message content"
}
```

**Example:**
```
PUT /messages/msg-123
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message updated",
  "data": {
    "id": "msg-123",
    "content": "Updated message content",
    "isEdited": true,
    "editedAt": "2024-12-13T10:10:00Z",
    "editedContent": "Original content here"
  }
}
```

---

### 7. Delete Message (HTTP)

**Endpoint:** `DELETE /messages/:messageId`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**
```
DELETE /messages/msg-123
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

### 8. Add Message Reaction (HTTP)

**Endpoint:** `POST /messages/:messageId/reactions`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

**Body:**
```json
{
  "emoji": "👍"
}
```

**Example:**
```
POST /messages/msg-123/reactions
```

**Supported Emojis:**
```
👍 ❤️ 😂 😢 😡 👏 🔥 ✨ 🎉 😍 🤔 👌
```

**Response (201):**
```json
{
  "success": true,
  "message": "Reaction added",
  "data": {
    "messageId": "msg-123",
    "emoji": "👍",
    "userId": "user-123",
    "createdAt": "2024-12-13T10:15:00Z"
  }
}
```

---

### 9. Remove Message Reaction (HTTP)

**Endpoint:** `DELETE /messages/:messageId/reactions/:emoji`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**
```
DELETE /messages/msg-123/reactions/👍
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reaction removed"
}
```

---

### 10. Get Message Reactions (HTTP)

**Endpoint:** `GET /messages/:messageId/reactions`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**
```
GET /messages/msg-123/reactions
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message reactions retrieved",
  "data": {
    "messageId": "msg-123",
    "reactions": [
      {
        "emoji": "👍",
        "count": 3,
        "users": [
          {
            "userId": "user-123",
            "name": "John"
          },
          {
            "userId": "friend-456",
            "name": "Jane"
          },
          {
            "userId": "friend-789",
            "name": "Bob"
          }
        ]
      },
      {
        "emoji": "❤️",
        "count": 2,
        "users": [
          {
            "userId": "friend-456",
            "name": "Jane"
          },
          {
            "userId": "friend-789",
            "name": "Bob"
          }
        ]
      }
    ]
  }
}
```

---

## Socket.io Real-Time Events

### Connection Setup

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token',
    userId: 'your_user_id'
  }
});

socket.on('connect', () => {
  console.log('Connected to Socket.io server');
  // Join conversation room
  socket.emit('conversation:open', 'conv-123');
});
```

---

### Full Real-Time Message Flow

```javascript
// 1. Connect and open conversation
socket.emit('conversation:open', 'conv-123');

// 2. Listen for incoming messages
socket.on('message:received', (message) => {
  console.log('New message:', message);
  // Auto-marked as read since you're in the conversation room
});

// 3. Send a message
socket.emit('message:send', {
  conversationId: 'conv-123',
  content: 'Hello Jane!',
  type: 'TEXT'
});

// 4. Listen for read receipts
socket.on('message:read', (data) => {
  console.log(`${data.userId} read your message`);
});

// 5. Show typing indicator
socket.emit('typing:start', 'conv-123');
// User is typing...
socket.emit('typing:stop', 'conv-123');

// 6. Listen for typing status
socket.on('user:typing', (data) => {
  if (data.isTyping) {
    console.log(`${data.userId} is typing...`);
  } else {
    console.log(`${data.userId} stopped typing`);
  }
});

// 7. Close conversation when done
socket.emit('conversation:close', 'conv-123');
```

---

## Complete Testing Workflow

### Step 1: Setup Users & Conversation
```
1. Register User A (Alice)
2. Register User B (Bob)
3. Make them friends
4. Create conversation between Alice & Bob
5. Save conversationId
```

### Step 2: Test HTTP Message Endpoints

```
1. GET /messages/conversation/:conversationId
   - Get all messages in conversation (should be empty initially)

2. POST /messages/mark-as-read
   - Mark all messages as read (for future testing)
```

### Step 3: Test Real-Time Socket.io Messages

**Terminal 1 (Alice's perspective):**
```javascript
// Alice connects and opens conversation
const aliceSocket = io('http://localhost:5000', {
  auth: { token: ALICE_TOKEN, userId: ALICE_ID }
});

aliceSocket.emit('conversation:open', CONVERSATION_ID);

// Alice listens for messages
aliceSocket.on('message:received', (msg) => {
  console.log('Alice received:', msg);
});

// Alice listens for typing
aliceSocket.on('user:typing', (data) => {
  if (data.isTyping) console.log('Bob is typing...');
});
```

**Terminal 2 (Bob's perspective):**
```javascript
// Bob connects and opens conversation
const bobSocket = io('http://localhost:5000', {
  auth: { token: BOB_TOKEN, userId: BOB_ID }
});

bobSocket.emit('conversation:open', CONVERSATION_ID);

// Bob sends a message
bobSocket.emit('message:send', {
  conversationId: CONVERSATION_ID,
  content: 'Hi Alice!',
  type: 'TEXT'
});

// Bob shows typing
bobSocket.emit('typing:start', CONVERSATION_ID);
setTimeout(() => {
  bobSocket.emit('typing:stop', CONVERSATION_ID);
}, 2000);

// Bob listens for messages
bobSocket.on('message:received', (msg) => {
  console.log('Bob received:', msg);
});

// Bob listens for read receipts
bobSocket.on('message:read', (data) => {
  console.log('Alice read:', data.messageId);
});
```

### Step 4: Test HTTP Message Actions

```
1. Send message via Socket.io (Bob → Alice)
2. Check message received in real-time
3. Mark messages as read (HTTP)
4. Edit message (PUT /messages/:id)
5. Add reaction (POST /messages/:id/reactions)
6. Get reactions (GET /messages/:id/reactions)
7. Remove reaction (DELETE /messages/:id/reactions/:emoji)
8. Get read status (GET /messages/:id/read-by)
9. Delete message (DELETE /messages/:id)
```

---

## Message Status Flow

```
Sending:  SENT → DELIVERED → READ
           ↓
         FAILED (optional)

Timeline:
1. User sends message → Status: SENT
2. Message broadcasted to recipient → Status: DELIVERED
3. Recipient in conversation room → Status: READ (auto-marked)
4. Read receipt sent back → Read notification
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid message type"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You can only edit or delete your own messages"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Message not found"
}
```

---

## Quick Reference - Message Endpoints

| Action | Method | Endpoint | Real-Time |
|--------|--------|----------|-----------|
| Send Message | Socket | `message:send` | ✅ Yes |
| Receive Message | Socket | `message:received` | ✅ Yes |
| Mark as Read | POST | `/messages/mark-as-read` | ❌ HTTP |
| Get Messages | GET | `/messages/conversation/:id` | ❌ HTTP |
| Get Read Status | GET | `/messages/:id/read-by` | ❌ HTTP |
| Edit Message | PUT | `/messages/:id` | ❌ HTTP |
| Delete Message | DELETE | `/messages/:id` | ❌ HTTP |
| Add Reaction | POST | `/messages/:id/reactions` | ❌ HTTP |
| Remove Reaction | DELETE | `/messages/:id/reactions/:emoji` | ❌ HTTP |
| Get Reactions | GET | `/messages/:id/reactions` | ❌ HTTP |

---

## Important Notes

✅ **Auto-Mark as Read:**
- Messages are automatically marked as read when received (if user in conversation room)
- Socket.io handles this automatically when user joins the room

⚠️ **Message Ordering:**
- Messages are ordered by creation time (oldest first)
- Use pagination for large conversations

📝 **Message Editing:**
- Only original sender can edit messages
- Edit timestamp and original content are preserved
- Edit flag shows message was modified

🔄 **Real-Time Sync:**
- Socket.io broadcasts all changes to conversation participants
- HTTP endpoints for bulk operations and status checks
- Typing indicators and read receipts update in real-time

🔒 **Security:**
- Users can only see/edit their own messages
- Conversation access verified for all operations
- Authentication required for all endpoints

