# HTTP vs Socket.IO: Complete Comparison

## Operations Matrix

| Operation | HTTP | Socket.IO | When to Use |
|-----------|------|-----------|------------|
| **Send Message** | ❌ NO | ✅ YES | Real-time instant delivery |
| **Fetch History** | ✅ YES | ❌ NO | Load old messages on app start |
| **Edit Message** | ✅ YES (optional) | ✅ YES | Best: Socket.IO for real-time broadcast |
| **Delete Message** | ✅ YES (optional) | ✅ YES | Best: Socket.IO for real-time broadcast |
| **Search Messages** | ✅ YES | ❌ NO | Search is request-response |
| **Mark as Read** | ✅ YES | ✅ YES | HTTP for bulk, Socket.IO for broadcast |
| **Get Read Receipts** | ✅ YES | ❌ NO | Query specific message status |
| **React to Message** | ✅ YES | ✅ YES | Best: Socket.IO for real-time broadcast |
| **Get Reactions** | ✅ YES | ❌ NO | Load reactions on message display |
| **Typing Indicator** | ❌ NO | ✅ YES | Real-time only, no persistence |
| **Online Status** | ❌ NO | ✅ YES | Real-time presence, no persistence |

## Architecture Decision Tree

```
Does the operation need INSTANT delivery to other online users?
├─ YES → Use Socket.IO
│  ├─ Does it also need to be saved to database?
│  │  ├─ YES → Call messageService method in Socket handler
│  │  │        (sends new message, edits, deletes, reactions)
│  │  └─ NO → Just emit event
│  │          (typing indicators, online status)
│  └─ Broadcast to: io.to(conversationId).emit('event', data)
│
└─ NO → Use HTTP
   ├─ Is it a bulk operation?
   │  ├─ YES → POST /bulk-operation
   │  └─ NO → POST/GET/PATCH/DELETE /resource
   ├─ Response with: sendResponse(res, 200, 'Success', data)
   └─ Client can then notify via Socket.IO if needed
```

## Real-World Scenarios

### Scenario 1: User A Sends a Message to User B

```
USER A (Browser)           SERVER               DATABASE            USER B (Browser)
    |                         |                     |                    |
    |-- message:send -------->|                     |                    |
    |   (Alice: "Hello")      |-- CREATE msg ------>|                    |
    |                         |<-- msg ID ----------|                    |
    |                         |                     |                    |
    |<-- message:received ----| (confirmation)      |                    |
    |   (Alice sees delivery) |                     |                    |
    |                         |-- BROADCAST message:received ---------->|
    |                         |                     |                    |
    |                         |                     |                  Bob sees
    |                         |                     |                  message
    |                         |                     |                    |
    |                         |<-- message:read ----| (auto-mark on open)
    |                         |                     |                    |
    |<- user:read-receipt ----|                     |                    |
    |  (Alice sees Bob read)  |                     |                    |
```

**Protocols Used:**
- Socket.IO: message:send, message:received, user:read-receipt
- Database: CREATE message, CREATE message_read
- No HTTP needed (real-time only)

### Scenario 2: User A Searches Old Messages

```
USER A (Browser)           SERVER               DATABASE
    |                         |                     |
    |-- GET /messages/search--|                     |
    |   (?q=hello)            |-- SELECT * WHERE   |
    |                         |   content LIKE      |
    |                         |   "hello" ---------->|
    |                         |<-- 10 messages -----|
    |<-- 200 OK + messages----|                     |
    |   Display history       |                     |
    |                         |                     |
    
(No Socket.IO needed - just HTTP REST)
```

**Protocols Used:**
- HTTP: GET /messages/search
- Database: SELECT (read-only)
- No real-time needed

### Scenario 3: User A Edits a Message

```
USER A (Browser)           SERVER               DATABASE            USER B (Browser)
    |                         |                     |                    |
    |-- message:edit -------->|                     |                    |
    |   (msg-456: edited)     |-- UPDATE msg ------>|                    |
    |                         |<-- updated msg -----|                    |
    |                         |                     |                    |
    |<-- message:edited -----|  (confirmation)      |                    |
    |   (edit success)        |                     |                    |
    |                         |-- BROADCAST message:edited ----------->|
    |                         |                     |                    |
    |                         |                     |                  Bob sees
    |                         |                     |                  edit notice
```

**Protocols Used:**
- Socket.IO: message:edit, message:edited
- Database: UPDATE message
- No HTTP needed (real-time better)

### Scenario 4: User A Gets Read Receipts for a Message

```
USER A (Browser)           SERVER               DATABASE
    |                         |                     |
    |-- GET /read-receipts ---+-- msg-456 -+       |
    |   (/msg-456)            |            |       |
    |                         |       SELECT *    |
    |                         |       FROM        |
    |                         |       message_    |
    |                         |       reads ----->|
    |                         |<-- 3 read records-|
    |<-- 200 OK + receipts----|                    |
    |   Display who read      |                    |
    |   (Alice, Bob, Charlie) |                    |
    |                         |                    |
    
(No Socket.IO needed - query operation)
```

**Protocols Used:**
- HTTP: GET /read-receipts/:messageId
- Database: SELECT from message_reads
- No real-time needed

### Scenario 5: User A & B Both Typing in Conversation

```
USER A (Browser)           SERVER               USER B (Browser)
    |                         |                    |
    |-- typing:start -------->|                    |
    |                         |-- BROADCAST user:typing -->|
    |                         |   (isTyping: true) Bob sees
    |                         |                    | "Alice typing..."
    |                         |                    |
    (User A types for 3 sec) |                    |
    |                         |                    |
    |-- typing:stop -------->|                    |
    |                         |-- BROADCAST user:typing -->|
    |                         |   (isTyping: false)        |
    |                         |                    | Bob sees
    |                         |                    | "Alice stopped"
    |                         |                    |
    
(NO DATABASE - Real-time only, typed text is not saved)
```

**Protocols Used:**
- Socket.IO: typing:start, typing:stop, user:typing
- Database: None
- Real-time presence awareness

## HTTP Endpoint Complete Reference

### Messages

#### Send Message
```
POST /api/v1/messages
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "conversationId": "conv-123",
  "content": "Hello!",
  "type": "TEXT",
  "mediaUrls": []
}

Response: 201 Created
{
  "id": "msg-456",
  "conversationId": "conv-123",
  "senderId": "alice-id",
  "content": "Hello!",
  "status": "SENT",
  "createdAt": "2025-12-13T..."
}
```

#### Get Messages (History)
```
GET /api/v1/messages?conversationId=conv-123&limit=20&page=1
Authorization: Bearer TOKEN

Response: 200 OK
[
  { id, conversationId, senderId, content, status, createdAt },
  ...
]
```

#### Edit Message
```
PATCH /api/v1/messages
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "messageId": "msg-456",
  "newContent": "Hello, edited!"
}

Response: 200 OK
{ id, content, isEdited: true, editedAt, ... }
```

#### Delete Message
```
DELETE /api/v1/messages
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "messageId": "msg-456"
}

Response: 204 No Content
```

#### Mark as Read
```
POST /api/v1/messages/mark-as-read
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "conversationId": "conv-123"
}

Response: 200 OK
{ "message": "Messages marked as read" }
```

#### Search Messages
```
GET /api/v1/messages/search?conversationId=conv-123&q=hello
Authorization: Bearer TOKEN

Response: 200 OK
[
  { id, conversationId, senderId, content, createdAt },
  ...
]
```

#### React to Message
```
POST /api/v1/messages/react
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "messageId": "msg-456",
  "emoji": "❤️"
}

Response: 201 Created
{ id, messageId, userId, emoji, createdAt }
```

#### Remove Reaction
```
DELETE /api/v1/messages/react
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "messageId": "msg-456",
  "emoji": "❤️"
}

Response: 204 No Content
```

#### Get All Reactions for Message
```
GET /api/v1/messages/:messageId/reactions
Authorization: Bearer TOKEN

Response: 200 OK
{
  "❤️": [ { userId, userName, userAvatar }, ... ],
  "👍": [ { userId, userName, userAvatar }, ... ]
}
```

#### Get Read Receipts
```
GET /api/v1/messages/:messageId/read-receipts
Authorization: Bearer TOKEN

Response: 200 OK
[
  { userId, user: { id, name, avatar }, readAt },
  ...
]
```

## Summary Table

| Aspect | HTTP | Socket.IO |
|--------|------|-----------|
| **Best For** | Request-response | Real-time push |
| **Latency** | ~200-500ms | <50ms |
| **Database** | Full CRUD | Selective writes |
| **Error Responses** | HTTP status codes | socket.emit('error') |
| **Authentication** | JWT Bearer token | JWT in handshake |
| **Stateless** | ✅ Yes | ❌ No (connection state) |
| **Scalability** | High (stateless) | Medium (connection state) |
| **Use Case** | Explicit requests | Instant notifications |

## Key Decisions Made

✅ **Send message:** Socket.IO (instant real-time)
✅ **Edit/Delete message:** Socket.IO (broadcast changes instantly)
✅ **React to message:** Socket.IO (broadcast reactions instantly)
✅ **Fetch history:** HTTP (request-response)
✅ **Search messages:** HTTP (query operation)
✅ **Mark as read:** HTTP primary + Socket.IO broadcast
✅ **Typing indicators:** Socket.IO only (real-time, no persistence)
✅ **Online status:** Socket.IO only (real-time, no persistence)

This ensures:
- ⚡ **Fast, responsive UI**
- 💾 **Efficient database operations**
- 🔄 **Consistent state across users**
- 📱 **Scalable architecture**
