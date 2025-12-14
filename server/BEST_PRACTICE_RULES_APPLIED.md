# Best Practice Rules Applied ✅

This document outlines the architectural best practices now implemented in the chat system.

## 1. Separation of Concerns: HTTP vs Socket.IO

### HTTP Endpoints (Request-Response)
Used for **explicit user actions** where client asks for something specific:

| Operation | Endpoint | Purpose |
|-----------|----------|---------|
| **Fetch History** | `GET /messages` | Client explicitly requests old message history |
| **Search Messages** | `GET /messages/search` | Client searches for specific messages |
| **Edit Message** | `PATCH /messages/:id` | User initiates edit from UI |
| **Delete Message** | `DELETE /messages/:id` | User deletes from UI |
| **Mark as Read** | `POST /mark-as-read` | User opens conversation (HTTP call) |
| **Reactions** | `POST /react` | User clicks reaction button |
| **Read Receipts** | `GET /read-receipts/:messageId` | Client requests read status |

### Socket.IO Events (Real-Time Push)
Used for **instant notifications** where server pushes to clients:

| Event | Direction | Purpose |
|-------|-----------|---------|
| `message:send` | Client→Server→Client | Send new message in real-time |
| `message:received` | Server→Client | Receive message instantly (broadcast) |
| `message:edit` | Client→Server→Client | Edit message and broadcast changes |
| `message:edited` | Server→Client | Notify all users of edit |
| `message:delete` | Client→Server→Client | Delete message and broadcast |
| `message:deleted` | Server→Client | Notify all users of deletion |
| `message:react` | Client→Server→Client | Add reaction and broadcast |
| `message:reaction` | Server→Client | Notify all users of reaction |
| `message:read` | Client→Server→Client | Notify about read receipts |
| `user:read-receipt` | Server→Client | Broadcast read status |
| `typing:start/stop` | Client→Server→Client | Real-time typing indicators |
| `user:typing` | Server→Client | Broadcast typing status |
| `conversation:open` | Client→Server | Join room + auto-mark |
| `conversation:close` | Client→Server | Leave room |

## 2. Database Write Operations

### Rule: Socket.IO can save to database BUT...
✅ **ALLOWED**: Operations that must be saved immediately
- Sending new messages
- Creating reactions
- Editing/Deleting messages (when needed instantly)
- Marking as read (optional, can be HTTP only)

❌ **NOT ALLOWED**: Doing duplicate work
- Don't auto-mark every message on `message:send` (wasteful)
- Instead: Mark when `conversation:open` or via HTTP endpoint

## 3. Data Flow Patterns

### Pattern 1: Send Message
```
Client                Socket.IO              Database
  |                     |                       |
  |--message:send------>|                       |
  |                     |--save to DB---------->|
  |                     |<--message object------|
  |<--message:received--| (broadcast to room)
  |                     |
```

### Pattern 2: Edit Message
```
Client                Socket.IO              Database
  |                     |                       |
  |--message:edit------>|                       |
  |                     |--update DB----------->|
  |                     |<--updated message-----|
  |<--message:edited----|  (broadcast to room)
  |                     |
```

### Pattern 3: Mark as Read
```
HTTP Route (REST)       Service              Database
  |                       |                    |
  |--POST /mark-read----->|                    |
  |                       |--create records--->|
  |<--200 OK--------------|                    |
  |                       |
  (Then notify via Socket.IO)
```

### Pattern 4: Typing Indicator (Real-Time Only)
```
Client A          Socket.IO          Client B
  |                  |                  |
  |--typing:start--->|                  |
  |                  |--user:typing---->|
  |                  |                  |
  | (NO database write - just real-time)
```

## 4. Message Status Flow

```
SENT → (broadcast via Socket.IO)
     → DELIVERED (when client receives)
     → READ (when client marks as read via HTTP or conversation:open)
```

**Timeline:**
1. **SENT**: Created by `message:send` handler
2. **DELIVERED**: Immediately (Socket.IO broadcasts to room)
3. **READ**: When recipient:
   - Opens conversation → `conversation:open` auto-marks
   - Or explicitly marks → HTTP `POST /mark-as-read`
   - Or listens for → `message:read` Socket.IO event

## 5. Auto-Mark Strategy (Best Practice)

### ✅ IMPLEMENTED:
1. **On conversation:open** (Socket.IO)
   - Auto-mark all unread messages from OTHER users
   - Broadcast via `message:read` event

2. **On HTTP /mark-as-read** (Request-Response)
   - Explicitly mark messages as read
   - For bulk operations or periodic sync

### ❌ NOT DONE (Anti-pattern):
- ~~Auto-mark on message:send for ALL users~~ ❌
- ~~Auto-mark on message:received handler~~ ❌
- ~~Create MessageRead records excessively~~ ❌

**Why?**
- Wastes database writes
- Creates duplicate records
- Inefficient loop through room participants

## 6. Socket.IO Room Architecture

```
io.to(conversationId).emit('message:received', msg)
├── Sends to ALL users in room (including sender)
├── sender gets confirmation
└── recipient gets new message

socket.to(conversationId).emit('messages:read', data)
├── Sends to ALL EXCEPT sender
├── Useful for read receipts
└── Prevents feedback loop
```

## 7. Code Organization

```
src/
├── services/
│   └── message.service.ts          ← Business logic (used by both)
│       ├── sendMessage()            ← Save to DB
│       ├── editMessage()            ← Save to DB
│       ├── deleteMessage()          ← Save to DB
│       ├── markMessagesAsRead()     ← Save to DB
│       ├── reactToMessage()         ← Save to DB
│       └── getMessages()            ← Read from DB
│
├── controllers/
│   └── message.controller.ts        ← HTTP handlers
│       ├── sendMessage              ← REST endpoint
│       ├── editMessage              ← REST endpoint
│       ├── deleteMessage            ← REST endpoint
│       ├── markAsRead               ← REST endpoint
│       └── reactToMessage           ← REST endpoint
│
├── routes/
│   └── message.route.ts             ← Express routes
│
└── socket/
    └── chat.socket.ts               ← Socket.IO handlers
        ├── message:send             ← Real-time send
        ├── message:edit             ← Real-time edit
        ├── message:delete           ← Real-time delete
        ├── message:react            ← Real-time react
        └── conversation:open        ← Join + auto-mark
```

**Key Pattern:**
- **Service**: Business logic (DB operations)
- **Controller**: HTTP REST endpoints call service
- **Socket Handlers**: Socket.IO events call same service
- **No duplication**: Both HTTP and WebSocket use identical business logic

## 8. Real-Time Testing Flow

### Test Scenario: Alice & Bob Messaging

```
BROWSER 1 (Alice)         |  BROWSER 2 (Bob)
─────────────────────────┼──────────────────────
alice.emit('message:send')│
  ↓                       │
Save to DB                │
  ↓                       │
Broadcast message:received│──→ bob.on('message:received')
  ↓                       │     ↓
Sender confirms           │     Display message
  ↓                       │     ↓
                          │     bob.emit('message:read')
                          │     ↓
                          │     Broadcast read receipt
                          ↓
alice.on('user:read-receipt') ← Read notification
  ↓
Display "Bob read message"
```

## 9. Error Handling

Each Socket.IO handler includes:
```typescript
try {
  // Save to DB and broadcast
  const result = await messageService.operation();
  io.to(room).emit('event', result);
} catch (error) {
  console.error('Error:', error);
  socket.emit('error', { message: 'User-friendly error' });
}
```

## 10. Validation

**HTTP Endpoints:**
- Validate with Zod schemas in DTOs
- Check user authorization
- Return error responses

**Socket.IO Handlers:**
- Extract userId from socket.data (already authenticated)
- Validate data structure
- Send errors via socket.emit()

## Summary of Changes

| Before | After |
|--------|-------|
| Auto-mark on message:send | Only auto-mark on conversation:open |
| No real-time edits | message:edit broadcast |
| No real-time deletes | message:delete broadcast |
| No real-time reactions | message:react broadcast |
| Missing read receipts | message:read event broadcast |
| Confusing concerns | Clear HTTP vs Socket.IO separation |

## Result

✅ **Cleaner Architecture**
✅ **Efficient Database Operations**
✅ **Real-Time Messaging**
✅ **Best Practice Patterns**
✅ **Scalable Design**
