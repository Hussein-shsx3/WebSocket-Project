# Socket.IO Event Reference

## Message Operations

### Send Message (Real-Time)
```typescript
// Client sends
socket.emit('message:send', {
  conversationId: 'conv-123',
  content: 'Hello!',
  type: 'TEXT',
  mediaUrls: []
})

// Server broadcasts to all users
socket.on('message:received', {
  id: 'msg-456',
  conversationId: 'conv-123',
  senderId: 'alice-id',
  content: 'Hello!',
  status: 'SENT',
  createdAt: Date,
  sender: { id, name, avatar }
})
```

### Edit Message (Real-Time)
```typescript
// Client edits
socket.emit('message:edit', {
  messageId: 'msg-456',
  conversationId: 'conv-123',
  newContent: 'Hello, edited!'
})

// Server broadcasts to conversation
socket.on('message:edited', {
  messageId: 'msg-456',
  conversationId: 'conv-123',
  newContent: 'Hello, edited!',
  isEdited: true,
  editedAt: Date
})
```

### Delete Message (Real-Time)
```typescript
// Client deletes
socket.emit('message:delete', {
  messageId: 'msg-456',
  conversationId: 'conv-123'
})

// Server broadcasts to conversation
socket.on('message:deleted', {
  messageId: 'msg-456',
  conversationId: 'conv-123'
})
```

### React to Message (Real-Time + Database)
```typescript
// Client reacts
socket.emit('message:react', {
  messageId: 'msg-456',
  conversationId: 'conv-123',
  emoji: '❤️'
})

// Server broadcasts to conversation
socket.on('message:reaction', {
  messageId: 'msg-456',
  conversationId: 'conv-123',
  userId: 'alice-id',
  emoji: '❤️',
  removed: false
})
```

## Read Receipts

### Mark as Read (Real-Time Broadcast)
```typescript
// Client broadcasts read status
socket.emit('message:read', {
  conversationId: 'conv-123',
  messageIds: ['msg-456', 'msg-789']
})

// Server broadcasts to other users
socket.on('user:read-receipt', {
  conversationId: 'conv-123',
  userId: 'alice-id',
  messageIds: ['msg-456', 'msg-789'],
  readAt: Date
})
```

## Conversation Management

### Open Conversation (Join Room + Auto-Mark)
```typescript
// Client opens conversation
socket.emit('conversation:open', 'conv-123')

// Server:
// 1. Joins socket to room
// 2. Auto-marks unread messages as read
// 3. Broadcasts to others
socket.on('messages:read', {
  conversationId: 'conv-123',
  userId: 'alice-id',
  readAt: Date
})
```

### Close Conversation (Leave Room)
```typescript
// Client closes
socket.emit('conversation:close', 'conv-123')

// Server leaves room
```

## Typing Indicators (Real-Time Only - No Database)

### Start Typing
```typescript
// Client starts typing
socket.emit('typing:start', 'conv-123')

// Other users see
socket.on('user:typing', {
  conversationId: 'conv-123',
  userId: 'alice-id',
  isTyping: true
})
```

### Stop Typing
```typescript
// Client stops typing
socket.emit('typing:stop', 'conv-123')

// Other users see
socket.on('user:typing', {
  conversationId: 'conv-123',
  userId: 'alice-id',
  isTyping: false
})
```

## User Status (Real-Time Only)

### User Online
```typescript
socket.emit('user:online')

// Broadcast to all
socket.on('user:status', {
  userId: 'alice-id',
  status: 'online'
})
```

### User Offline
```typescript
// On disconnect
socket.on('disconnect')

// Broadcast to all
socket.on('user:status', {
  userId: 'alice-id',
  status: 'offline'
})
```

## Error Handling

All handlers emit errors:
```typescript
socket.on('error', {
  message: 'User-friendly error message'
})
```

## Best Practices Applied

✅ **Socket.IO for Real-Time**
- Send new messages
- Edit/delete messages
- Typing indicators
- Presence awareness
- Reactions (with database)

✅ **HTTP for Request-Response**
- Fetch message history
- Search messages
- Explicit mark as read (bulk)
- Get read receipts
- Reactions (also available)

✅ **No Duplication**
- Same service methods used by both HTTP and WebSocket
- Business logic centralized
- Consistent behavior

✅ **Efficient Database Operations**
- Save only when needed
- Auto-mark only on conversation:open
- Prevent excessive writes
- Use skipDuplicates for safety

## Connection Example

```typescript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
})

// Listen for connection
socket.on('connect', () => {
  console.log('✅ Connected')
  
  // Open a conversation
  socket.emit('conversation:open', 'conv-123')
})

// Listen for new messages
socket.on('message:received', (message) => {
  console.log('New message:', message.content)
})

// Listen for typing
socket.on('user:typing', (data) => {
  if (data.isTyping) {
    console.log(`${data.userId} is typing...`)
  }
})

// Listen for read receipts
socket.on('user:read-receipt', (data) => {
  console.log(`${data.userId} read your message`)
})

// Send a message
socket.emit('message:send', {
  conversationId: 'conv-123',
  content: 'Hello!',
  type: 'TEXT'
})

// React to a message
socket.emit('message:react', {
  messageId: 'msg-456',
  conversationId: 'conv-123',
  emoji: '❤️'
})
```
