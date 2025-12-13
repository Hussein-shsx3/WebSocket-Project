# Message API Testing Guide - Step by Step

## ⚠️ Important: Mark as Read - HYBRID Approach

**There are TWO ways messages get marked as read:**

### 1. **AUTOMATIC (WebSocket) - When User is IN Conversation**
```
User opens conversation → Joins Socket.io room
   ↓
New message arrives → message:received event
   ↓
Server checks: "Is user in conversation room?" → YES
   ↓
✅ Message automatically marked as READ (no manual action needed)
```

### 2. **MANUAL (HTTP) - Bulk Mark When Opening Conversation**
```
User opens conversation → HTTP POST /messages/mark-as-read
   ↓
Server marks ALL unread messages as read
   ↓
✅ All previous messages marked as READ
```

---

## Step-by-Step Testing Guide

### STEP 1: Register & Login Two Users

**User A (Alice):**
```
POST http://localhost:5000/api/v1/auth/register
Body:
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "ALICE_TOKEN_HERE",
    "user": {
      "id": "alice-id-123",
      "name": "Alice"
    }
  }
}

Save: ALICE_TOKEN and ALICE_ID
```

**User B (Bob):**
```
POST http://localhost:5000/api/v1/auth/register
Body:
{
  "name": "Bob",
  "email": "bob@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "BOB_TOKEN_HERE",
    "user": {
      "id": "bob-id-456",
      "name": "Bob"
    }
  }
}

Save: BOB_TOKEN and BOB_ID
```

---

### STEP 2: Make Them Friends

**Alice sends friend request to Bob:**
```
POST http://localhost:5000/api/v1/friends/requests
Headers: Authorization: Bearer ALICE_TOKEN
Body:
{
  "recipientId": "bob-id-456"
}

Response: { "success": true, "data": { "requestId": "freq-123" } }
```

**Bob accepts the request:**
```
POST http://localhost:5000/api/v1/friends/requests/freq-123/accept
Headers: Authorization: Bearer BOB_TOKEN
Body: {}

Response: { "success": true, "message": "Friend request accepted" }
```

---

### STEP 3: Create a Conversation

**Alice creates conversation with Bob:**
```
POST http://localhost:5000/api/v1/conversations
Headers: Authorization: Bearer ALICE_TOKEN
Body:
{
  "participantId": "bob-id-456"
}

Response:
{
  "success": true,
  "data": {
    "id": "conv-789",
    "participants": [
      { "id": "alice-id-123", "name": "Alice" },
      { "id": "bob-id-456", "name": "Bob" }
    ]
  }
}

Save: CONVERSATION_ID = "conv-789"
```

---

### STEP 4: Mark as Read - HTTP Method (OPTIONAL - for unread messages)

**When user OPENS conversation, mark all unread messages as read:**
```
POST http://localhost:5000/api/v1/messages/mark-as-read
Headers: Authorization: Bearer ALICE_TOKEN
Body:
{
  "conversationId": "conv-789"
}

Response:
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "conversationId": "conv-789",
    "markedCount": 5,
    "markedAt": "2024-12-13T10:15:00Z"
  }
}
```

**⚠️ Use this ONLY if messages arrive while user is NOT connected to Socket.io**

---

### STEP 5: Connect to Socket.io - REAL-TIME TESTING

**Open Browser Console (F12 → Console Tab) and paste:**

**Alice (Tab 1):**
```javascript
// Connect Alice to Socket.io
const aliceSocket = io('http://localhost:5000', {
  auth: {
    token: 'ALICE_TOKEN_HERE',
    userId: 'alice-id-123'
  }
});

// Join conversation room
aliceSocket.on('connect', () => {
  console.log('✅ Alice Connected');
  aliceSocket.emit('conversation:open', 'conv-789');
});

// Listen for messages
aliceSocket.on('message:received', (message) => {
  console.log('📨 Alice received:', message);
  // ✅ Message is AUTOMATICALLY marked as read
  console.log('✅ Message auto-marked as READ');
});

// Listen for read receipts
aliceSocket.on('message:read', (data) => {
  console.log('👀 Bob read your message:', data.messageId);
});

// Listen for typing
aliceSocket.on('user:typing', (data) => {
  if (data.isTyping) {
    console.log(`${data.userId} is typing...`);
  } else {
    console.log(`${data.userId} stopped typing`);
  }
});
```

**Bob (Tab 2):**
```javascript
// Connect Bob to Socket.io
const bobSocket = io('http://localhost:5000', {
  auth: {
    token: 'BOB_TOKEN_HERE',
    userId: 'bob-id-456'
  }
});

// Join conversation room
bobSocket.on('connect', () => {
  console.log('✅ Bob Connected');
  bobSocket.emit('conversation:open', 'conv-789');
});

// Listen for messages
bobSocket.on('message:received', (message) => {
  console.log('📨 Bob received:', message);
  // ✅ Message is AUTOMATICALLY marked as read
  console.log('✅ Message auto-marked as READ');
});

// Listen for read receipts
bobSocket.on('message:read', (data) => {
  console.log('👀 Alice read your message:', data.messageId);
});

// Listen for typing
bobSocket.on('user:typing', (data) => {
  if (data.isTyping) {
    console.log(`${data.userId} is typing...`);
  } else {
    console.log(`${data.userId} stopped typing`);
  }
});
```

---

### STEP 6: Test Real-Time Messaging

**Alice sends message (in Alice's Tab 1 Console):**
```javascript
aliceSocket.emit('message:send', {
  conversationId: 'conv-789',
  content: 'Hi Bob! How are you?',
  type: 'TEXT'
});

// Expected output in BOTH consoles:
// 📨 Message received
// ✅ Auto-marked as READ
```

**Bob sends message (in Bob's Tab 2 Console):**
```javascript
bobSocket.emit('message:send', {
  conversationId: 'conv-789',
  content: 'Hi Alice! I\'m great!',
  type: 'TEXT'
});

// Expected output in BOTH consoles:
// 📨 Message received
// ✅ Auto-marked as READ
```

---

### STEP 7: Test Typing Indicator

**Bob shows he's typing (in Bob's Tab 2):**
```javascript
bobSocket.emit('typing:start', 'conv-789');
// Alice should see in Tab 1: "bob-id-456 is typing..."

setTimeout(() => {
  bobSocket.emit('typing:stop', 'conv-789');
  // Alice should see in Tab 1: "bob-id-456 stopped typing"
}, 3000);
```

---

### STEP 8: Test Mark as Read (HTTP) - When Offline

**Scenario: Bob is NOT in conversation room, Alice sends message**

Alice sends (Bob's Socket.io is NOT connected):
```javascript
aliceSocket.emit('message:send', {
  conversationId: 'conv-789',
  content: 'Bob are you there?',
  type: 'TEXT'
});

// ⚠️ Message stays UNREAD (Bob not in room)
```

**Later, Bob opens conversation and marks as read (HTTP):**
```
POST http://localhost:5000/api/v1/messages/mark-as-read
Headers: Authorization: Bearer BOB_TOKEN
Body:
{
  "conversationId": "conv-789"
}

Response: ✅ All messages marked as read
```

---

## Mark as Read - Decision Tree

```
Message arrives to user
    ↓
Is user connected to Socket.io AND in conversation room?
    ├─ YES → ✅ Auto-marked as READ (WebSocket - automatic)
    └─ NO → ⚠️ Stays UNREAD
            ↓
            User opens conversation later
            ↓
            POST /messages/mark-as-read (HTTP - manual)
            ↓
            ✅ All unread messages marked as READ
```

---

## Quick Reference Table

| Scenario | Method | Action | Automatic? |
|----------|--------|--------|------------|
| User in conversation, message arrives | WebSocket | message:received event | ✅ Yes |
| User offline, message arrives | - | Message stays unread | ❌ No |
| User opens app later, opens conversation | HTTP | POST /mark-as-read | ❌ Manual |
| User closes conversation | WebSocket | conversation:close | Auto-cleanup |

---

## Testing Checklist

- [ ] Step 1: Register Alice & Bob (save tokens)
- [ ] Step 2: Make them friends (accept request)
- [ ] Step 3: Create conversation (save conversationId)
- [ ] Step 4: (Optional) Try HTTP mark-as-read
- [ ] Step 5: Connect both to Socket.io (verify ✅ Connected)
- [ ] Step 6: Alice sends message, Bob receives (auto-read)
- [ ] Step 6: Bob sends message, Alice receives (auto-read)
- [ ] Step 7: Test typing indicator (both directions)
- [ ] Step 8: (Optional) Test offline + HTTP mark-as-read

---

## Common Errors & Fixes

### "Cannot connect to Socket.io"
```
❌ Wrong: http://localhost:5000/socket.io/
✅ Right: Use io() function in browser console
io('http://localhost:5000', { auth: { ... } })
```

### "401 Unauthorized"
```
Check your token:
- Is it valid? (copy from login response)
- Is it not expired?
- Format: Bearer TOKEN (with space)
```

### "Message not auto-marked as read"
```
Check:
1. Are you in the conversation room? (emit conversation:open)
2. Is Socket.io connected? (check console for ✅ Connected)
3. Are you on the same tab where you emitted conversation:open?
```

### "Cannot emit message:send"
```
Check:
1. Socket.io is connected first
2. conversationId is correct
3. content is not empty
4. type is valid (TEXT, IMAGE, VIDEO, FILE, SYSTEM_MESSAGE)
```
