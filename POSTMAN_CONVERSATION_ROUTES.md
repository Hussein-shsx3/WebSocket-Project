# Conversation API Endpoints - Postman Testing Guide

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

## 1. Create/Get Conversation with Friend

**Endpoint:** `POST /conversations`

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
  "friendId": "friend-user-id"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversation retrieved or created",
  "data": {
    "id": "conv-123",
    "participants": [
      { "id": "user-123", "name": "John", "email": "john@example.com" },
      { "id": "friend-456", "name": "Jane", "email": "jane@example.com" }
    ],
    "lastMessageAt": "2024-12-13T10:00:00Z",
    "isArchived": false,
    "createdAt": "2024-12-13T09:00:00Z"
  }
}
```

---

## 2. Get All Conversations (Inbox)

**Endpoint:** `GET /conversations?limit=20&page=1&search=query`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `limit` (optional): Number of conversations per page (default: 20)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search by friend name

**Example:**
```
GET /conversations?limit=10&page=1&search=Jane
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversations retrieved",
  "data": [
    {
      "id": "conv-123",
      "otherUser": {
        "id": "friend-456",
        "name": "Jane",
        "email": "jane@example.com",
        "avatar": "https://example.com/avatar.jpg"
      },
      "lastMessage": "How are you doing?",
      "lastMessageAt": "2024-12-13T10:15:00Z",
      "isArchived": false,
      "unreadCount": 2
    },
    {
      "id": "conv-789",
      "otherUser": {
        "id": "friend-789",
        "name": "John",
        "email": "john@example.com",
        "avatar": "https://example.com/john.jpg"
      },
      "lastMessage": "See you tomorrow!",
      "lastMessageAt": "2024-12-13T08:30:00Z",
      "isArchived": false,
      "unreadCount": 0
    }
  ]
}
```

---

## 3. Get Single Conversation with Messages

**Endpoint:** `GET /conversations/:conversationId`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**
```
GET /conversations/conv-123
```

**Response (200):** 
⚠️ **Note:** When you open a conversation, all messages are **automatically marked as read**
```json
{
  "success": true,
  "message": "Conversation retrieved",
  "data": {
    "id": "conv-123",
    "otherUser": {
      "id": "friend-456",
      "name": "Jane",
      "email": "jane@example.com",
      "avatar": "https://example.com/avatar.jpg"
    },
    "messages": [
      {
        "id": "msg-1",
        "content": "Hi there!",
        "type": "TEXT",
        "senderId": "friend-456",
        "senderName": "Jane",
        "status": "READ",
        "createdAt": "2024-12-13T10:00:00Z",
        "updatedAt": "2024-12-13T10:05:00Z"
      },
      {
        "id": "msg-2",
        "content": "How are you?",
        "type": "TEXT",
        "senderId": "friend-456",
        "senderName": "Jane",
        "status": "READ",
        "createdAt": "2024-12-13T10:05:00Z",
        "updatedAt": "2024-12-13T10:05:00Z"
      },
      {
        "id": "msg-3",
        "content": "I'm good! How about you?",
        "type": "TEXT",
        "senderId": "user-123",
        "senderName": "You",
        "status": "READ",
        "createdAt": "2024-12-13T10:10:00Z",
        "updatedAt": "2024-12-13T10:10:00Z"
      }
    ],
    "isArchived": false,
    "createdAt": "2024-12-13T09:00:00Z"
  }
}
```

---

## 4. Get Other User in Conversation

**Endpoint:** `GET /conversations/:conversationId/user`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**
```
GET /conversations/conv-123/user
```

**Response (200):**
```json
{
  "success": true,
  "message": "Other user retrieved",
  "data": {
    "id": "friend-456",
    "name": "Jane",
    "email": "jane@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "status": "online",
    "lastSeenAt": "2024-12-13T10:30:00Z"
  }
}
```

---

## 5. Archive Conversation

**Endpoint:** `PATCH /conversations/archive`

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
  "message": "Conversation archived",
  "data": {
    "id": "conv-123",
    "isArchived": true
  }
}
```

---

## 6. Unarchive Conversation

**Endpoint:** `PATCH /conversations/unarchive`

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
  "message": "Conversation unarchived",
  "data": {
    "id": "conv-123",
    "isArchived": false
  }
}
```

---

## 7. Delete Conversation

**Endpoint:** `DELETE /conversations`

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
  "message": "Conversation deleted successfully"
}
```

---

## Socket.io Events (Real-Time)

When testing with Socket.io, use the following events:

### Connect with Authentication
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token',
    userId: 'your_user_id'
  }
});
```

### Open Conversation (Auto-mark as read)
```javascript
socket.emit('conversation:open', 'conv-123');
```

### Send Message
```javascript
socket.emit('message:send', {
  conversationId: 'conv-123',
  content: 'Hello!',
  type: 'TEXT'
});
```

### Receive Message
```javascript
socket.on('message:received', (message) => {
  console.log('New message:', message);
  // Auto-marks as read when received while in conversation
});
```

### Typing Indicator
```javascript
socket.emit('typing:start', 'conv-123');
// ... user typing ...
socket.emit('typing:stop', 'conv-123');
```

### Close Conversation
```javascript
socket.emit('conversation:close', 'conv-123');
```

---

## Testing Workflow

1. **Create/Get Conversation** → Start a chat with a friend
2. **Get All Conversations** → See inbox with all conversations
3. **Get Single Conversation** → Open a conversation and auto-mark messages as read ✅
4. **Send Message** (via Socket.io) → Real-time message delivery
5. **Archive Conversation** → Hide conversation from inbox
6. **Unarchive Conversation** → Show archived conversation again
7. **Delete Conversation** → Permanently delete the conversation

---

## Error Responses

### 400 Bad Request
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

## Important Notes

✅ **Auto-Mark as Read:**
- When you call `GET /conversations/:conversationId`, all messages are automatically marked as read
- When you receive a message via Socket.io while in a conversation, it's automatically marked as read
- Other participants are notified with read receipts

📱 **Real-Time Features:**
- Connect via Socket.io for instant message delivery
- Typing indicators show when someone is typing
- Online status updates in real-time
- Read receipts show when messages are read

🔒 **Authentication:**
- All endpoints require a valid JWT token
- Token should be obtained from login endpoint first
- Include token in Authorization header as Bearer token

