# Quick Reference: Best Practices Applied ⚡

## The 3 Golden Rules

### Rule 1: HTTP = Request-Response
```
Client asks: "Give me X"
Server: "Here's X" ✅
Use for: Fetch, Search, Query operations
```

### Rule 2: Socket.IO = Real-Time Push
```
Client does action: emit('event')
Server broadcasts: "Everyone, client did X"
Use for: Instant notifications, presence
```

### Rule 3: Service Layer = Single Source of Truth
```
Both HTTP & Socket.IO call the same service methods
No duplicate logic!
```

---

## Which Technology to Use?

| Task | Technology | Why |
|------|-----------|-----|
| Send new message | **Socket.IO** | Instant delivery to online users |
| Load old messages | **HTTP** | Historical data, pagination |
| Edit message | **Socket.IO** | Broadcast changes instantly |
| Delete message | **Socket.IO** | Broadcast deletion instantly |
| Search messages | **HTTP** | Query operation |
| Mark as read | **HTTP** | Explicit action, can be batched |
| Notify of read | **Socket.IO** | Real-time broadcast |
| React with emoji | **Socket.IO** | Broadcast emoji instantly |
| Get reactions list | **HTTP** | Query current state |
| Typing indicator | **Socket.IO only** | Real-time, no persistence |
| Online status | **Socket.IO only** | Real-time, no persistence |

---

## Code Patterns

### ❌ WRONG
```typescript
// Saving in multiple places
socket.on('message:send', async (data) => {
  // Save to DB
  const msg = await messageService.sendMessage(...);
  
  // Auto-mark for everyone (wasteful!)
  const room = io.sockets.adapter.rooms.get(conversationId);
  for (const socketId of room) {
    await messageService.markMessagesAsRead(...);
  }
  
  io.to(conversationId).emit('message:received', msg);
});
```

### ✅ CORRECT
```typescript
// Only save message, broadcast without marking
socket.on('message:send', async (data) => {
  // Save to DB - one operation
  const msg = await messageService.sendMessage(...);
  
  // Broadcast - let client mark via conversation:open
  io.to(conversationId).emit('message:received', msg);
});

// Mark only when conversation opens
socket.on('conversation:open', async (conversationId) => {
  socket.join(conversationId);
  
  // Mark unread messages
  await messageService.markMessagesAsRead(conversationId, userId);
  
  // Notify others
  socket.to(conversationId).emit('messages:read', {
    conversationId,
    userId,
    readAt: new Date(),
  });
});
```

---

## Socket.IO Event Reference

### Real-Time Messages
```javascript
// Send
socket.emit('message:send', { conversationId, content })
socket.on('message:received', (msg) => { ... })

// Edit
socket.emit('message:edit', { messageId, conversationId, newContent })
socket.on('message:edited', (data) => { ... })

// Delete
socket.emit('message:delete', { messageId, conversationId })
socket.on('message:deleted', (data) => { ... })

// React
socket.emit('message:react', { messageId, conversationId, emoji })
socket.on('message:reaction', (data) => { ... })

// Read
socket.emit('message:read', { conversationId, messageIds })
socket.on('user:read-receipt', (data) => { ... })
```

### Room Management
```javascript
// Open conversation
socket.emit('conversation:open', 'conv-123')
socket.on('messages:read', (data) => { ... })

// Close conversation
socket.emit('conversation:close', 'conv-123')
```

### Typing Indicators (No Database)
```javascript
socket.emit('typing:start', 'conv-123')
socket.emit('typing:stop', 'conv-123')
socket.on('user:typing', (data) => {
  // data.isTyping: true or false
})
```

---

## HTTP Endpoint Reference

```bash
# Send (use Socket.IO instead)
POST /api/v1/messages

# Get history
GET /api/v1/messages?conversationId=conv-123&limit=20

# Edit
PATCH /api/v1/messages

# Delete
DELETE /api/v1/messages

# Mark as read
POST /api/v1/messages/mark-as-read

# Search
GET /api/v1/messages/search?conversationId=conv-123&q=hello

# React
POST /api/v1/messages/react
DELETE /api/v1/messages/react

# Get reactions
GET /api/v1/messages/:messageId/reactions

# Get read receipts
GET /api/v1/messages/:messageId/read-receipts
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                  Chat Application                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Client                                              │
│  ├─ HTTP Requests  → GET /messages (history)         │
│  ├─ HTTP Requests  → POST /mark-as-read             │
│  └─ Socket.IO      → message:send, message:react    │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Server                                              │
│  ├─ HTTP Routes    → Controllers → Service Layer     │
│  └─ Socket.IO      → Handlers    → Service Layer     │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Service Layer (Single Truth)                        │
│  ├─ sendMessage()                                    │
│  ├─ editMessage()                                    │
│  ├─ deleteMessage()                                  │
│  ├─ markMessagesAsRead()                             │
│  ├─ reactToMessage()                                 │
│  └─ getMessages()                                    │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Database (PostgreSQL + Prisma)                      │
│  ├─ messages                                         │
│  ├─ message_reads                                    │
│  ├─ message_reactions                                │
│  └─ conversations                                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Send message via Socket.IO → appears in other user's browser
- [ ] Edit message via Socket.IO → other user sees edit instantly
- [ ] Delete message via Socket.IO → other user sees deletion instantly
- [ ] React to message via Socket.IO → emoji appears instantly for both
- [ ] Open conversation → auto-marks unread messages
- [ ] HTTP GET /messages → loads message history
- [ ] HTTP POST /mark-as-read → marks messages as read
- [ ] HTTP GET /messages/search → finds messages by content
- [ ] Typing indicator → other user sees "typing..."
- [ ] Online status → shows who's online

---

## Performance Tips

1. **Avoid looping through rooms for marking** ❌
   ```typescript
   const room = io.sockets.adapter.rooms.get(conversationId);
   for (const socketId of room) { // ❌ Wasteful!
     await markMessagesAsRead(...);
   }
   ```

2. **Use conversation:open for auto-mark** ✅
   ```typescript
   socket.on('conversation:open', async (conversationId) => {
     await markMessagesAsRead(conversationId, userId); // ✅ Once!
   });
   ```

3. **Broadcast efficiently** ✅
   ```typescript
   io.to(conversationId).emit('event', data); // ✅ One broadcast
   ```

4. **Use skipDuplicates in database** ✅
   ```typescript
   await prisma.messageRead.createMany({
     data: [...],
     skipDuplicates: true // ✅ Prevents duplicates
   });
   ```

---

## Common Mistakes Avoided

| Mistake | Impact | Solution |
|---------|--------|----------|
| Auto-mark every message on send | ❌ DB overload | Mark only on conversation:open |
| Looping room participants | ❌ N+1 queries | Single service call |
| Using HTTP for real-time | ❌ Slow, polling | Use Socket.IO |
| Duplicating business logic | ❌ Bugs, inconsistent | Centralize in service |
| No error handling in sockets | ❌ Silent failures | socket.emit('error') |
| Mixing concerns | ❌ Hard to maintain | Clear HTTP/Socket separation |

---

## Result Summary

✅ **Before:** Auto-mark on every message, inefficient loops
✅ **After:** Smart auto-mark, efficient architecture
✅ **Benefit:** Faster, scalable, maintainable code

🎯 **Ready to test in browser!**
