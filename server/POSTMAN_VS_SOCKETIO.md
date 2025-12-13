# Socket.io Testing in Postman - Complete Guide

## ⚠️ Important: Postman WebSocket vs Socket.io

**Problem:** Postman's WebSocket feature is NOT the same as Socket.io!

- **Raw WebSocket:** Generic WebSocket protocol (what Postman does)
- **Socket.io:** Built on top of WebSocket with additional features (emit, on, rooms, etc.)

**Solution:** Postman cannot directly test Socket.io events. However, we have alternatives:

---

## Option 1: Use Browser Console (RECOMMENDED) ✅

This is the best way because Socket.io works natively in the browser.

**Steps:**
1. Open 2 browser tabs
2. Press F12 → Console
3. Type: `allow pasting`
4. Paste the Socket.io code from `SOCKET_IO_TEST_CODE.md`
5. Test with `aliceSendMessage()`, `bobSendMessage()`, etc.

**Why this works:** Browser has native Socket.io support through the CDN.

---

## Option 2: Use Socket.io Client Library (For Postman-like testing) ⚙️

If you insist on using Postman, you need to:

1. **Install Socket.io client in your server** (for testing)
2. **Create a test script** that uses Socket.io client
3. **Run the script** instead of using Postman

But this is more complicated than browser testing.

---

## Option 3: Setup Browser Tabs Properly

Since Postman WebSocket won't work with Socket.io, let's use the browser properly:

### Step 1: Open 2 Browser Tabs

**Tab 1:** `http://localhost:3000` (or any localhost page)
**Tab 2:** `http://localhost:3000` (or any localhost page)

### Step 2: Enable Pasting in Console

Press F12 in each tab:

```
You'll see: ⚠️ Pasting into the console can give attackers access...
Type: allow pasting
Press: Enter
```

### Step 3: Paste Socket.io Code

**In Tab 1 (Alice):**

Copy this entire block and paste in console:

```javascript
// ===== ALICE'S CONNECTION =====
const ALICE_TOKEN = "your_alice_jwt_token_here";
const ALICE_ID = "your_alice_user_id_here";
const CONVERSATION_ID = "your_conversation_id_here";

// Connect to Socket.io
const aliceSocket = io('http://localhost:5000', {
  auth: {
    token: ALICE_TOKEN,
    userId: ALICE_ID
  }
});

aliceSocket.on('connect', () => {
  console.log('✅ ALICE CONNECTED');
  aliceSocket.emit('conversation:open', CONVERSATION_ID);
  console.log('🚪 Alice opened conversation');
});

aliceSocket.on('message:received', (message) => {
  console.log('📨 ALICE RECEIVED:', message);
});

aliceSocket.on('message:read', (data) => {
  console.log('👀 Bob read your message:', data.messageId);
});

aliceSocket.on('user:typing', (data) => {
  console.log(data.isTyping ? '✍️ Bob is typing...' : '🛑 Bob stopped');
});

// Alice's commands
function aliceSendMessage(content) {
  aliceSocket.emit('message:send', {
    conversationId: CONVERSATION_ID,
    content: content,
    type: 'TEXT'
  });
  console.log('📤 Alice sent:', content);
}

function aliceTypingStart() {
  aliceSocket.emit('typing:start', CONVERSATION_ID);
  console.log('✍️ Alice started typing');
}

function aliceTypingStop() {
  aliceSocket.emit('typing:stop', CONVERSATION_ID);
  console.log('🛑 Alice stopped typing');
}

console.log('✅ Alice connected! Use: aliceSendMessage("text")');
```

**Replace with your actual values:**
- `your_alice_jwt_token_here` → Copy from Postman login response
- `your_alice_user_id_here` → Copy from Postman login response
- `your_conversation_id_here` → Copy from Postman create conversation response

---

**In Tab 2 (Bob):**

Copy this entire block and paste in console:

```javascript
// ===== BOB'S CONNECTION =====
const BOB_TOKEN = "your_bob_jwt_token_here";
const BOB_ID = "your_bob_user_id_here";
const CONVERSATION_ID = "your_conversation_id_here";

// Connect to Socket.io
const bobSocket = io('http://localhost:5000', {
  auth: {
    token: BOB_TOKEN,
    userId: BOB_ID
  }
});

bobSocket.on('connect', () => {
  console.log('✅ BOB CONNECTED');
  bobSocket.emit('conversation:open', CONVERSATION_ID);
  console.log('🚪 Bob opened conversation');
});

bobSocket.on('message:received', (message) => {
  console.log('📨 BOB RECEIVED:', message);
});

bobSocket.on('message:read', (data) => {
  console.log('👀 Alice read your message:', data.messageId);
});

bobSocket.on('user:typing', (data) => {
  console.log(data.isTyping ? '✍️ Alice is typing...' : '🛑 Alice stopped');
});

// Bob's commands
function bobSendMessage(content) {
  bobSocket.emit('message:send', {
    conversationId: CONVERSATION_ID,
    content: content,
    type: 'TEXT'
  });
  console.log('📤 Bob sent:', content);
}

function bobTypingStart() {
  bobSocket.emit('typing:start', CONVERSATION_ID);
  console.log('✍️ Bob started typing');
}

function bobTypingStop() {
  bobSocket.emit('typing:stop', CONVERSATION_ID);
  console.log('🛑 Bob stopped typing');
}

console.log('✅ Bob connected! Use: bobSendMessage("text")');
```

---

### Step 4: Test Messages

**In Tab 1 (Alice's Console):**
```javascript
aliceSendMessage("Hi Bob, how are you?")
```

**Expected in Tab 2 (Bob's Console):**
```
📨 BOB RECEIVED: {content: "Hi Bob, how are you?", ...}
✅ Auto-marked as READ
```

**In Tab 2 (Bob's Console):**
```javascript
bobSendMessage("Hi Alice! I'm great!")
```

**Expected in Tab 1 (Alice's Console):**
```
📨 ALICE RECEIVED: {content: "Hi Alice! I'm great!", ...}
✅ Auto-marked as READ
```

---

## Why NOT Use Postman WebSocket for Socket.io?

**Postman WebSocket Issues:**

1. ❌ **No Socket.io Protocol Support** - Postman uses raw WebSocket, Socket.io has its own protocol
2. ❌ **No Auth Middleware** - Postman won't send auth the way Socket.io expects
3. ❌ **No Emit/On Support** - Socket.io events won't work
4. ❌ **Wrong Connection Format** - Socket.io needs `io()` library, not raw WS

**Example:**
- ✅ Correct: `io('http://localhost:5000', { auth: {...} })`
- ❌ Wrong: `ws://localhost:5000` (Postman WebSocket)

---

## If You REALLY Want Postman-like Testing

### Use Postman for HTTP Endpoints Instead

Postman is great for testing **HTTP endpoints**, not WebSocket:

**Test Message Endpoints (HTTP):**

```
POST http://localhost:5000/api/v1/messages/mark-as-read
Headers: Authorization: Bearer ALICE_TOKEN
Body: { "conversationId": "conv-123" }

GET http://localhost:5000/api/v1/messages/conversation/conv-123
Headers: Authorization: Bearer ALICE_TOKEN

GET http://localhost:5000/api/v1/messages/msg-123/read-by
Headers: Authorization: Bearer ALICE_TOKEN

PUT http://localhost:5000/api/v1/messages/msg-123
Headers: Authorization: Bearer ALICE_TOKEN
Body: { "content": "Updated message" }

DELETE http://localhost:5000/api/v1/messages/msg-123
Headers: Authorization: Bearer ALICE_TOKEN

POST http://localhost:5000/api/v1/messages/msg-123/reactions
Headers: Authorization: Bearer ALICE_TOKEN
Body: { "emoji": "👍" }
```

**But for real-time testing (message:send, message:received):**
- Must use Socket.io
- Must use browser console
- Cannot use Postman

---

## Summary

| Feature | Postman | Browser Console |
|---------|---------|-----------------|
| HTTP Endpoints | ✅ Yes | ❌ No |
| WebSocket | ⚠️ Raw only | ✅ Yes |
| Socket.io | ❌ No | ✅ Yes |
| Real-time testing | ❌ No | ✅ Yes |
| Typing indicators | ❌ No | ✅ Yes |
| Auto-mark as read | ❌ No | ✅ Yes |
| Message events | ❌ No | ✅ Yes |

---

## ✅ Final Recommendation

**Use Both:**

1. **Postman** for HTTP endpoints:
   - Mark as read
   - Edit message
   - Delete message
   - Get reactions
   - Add reactions

2. **Browser Console** for real-time Socket.io:
   - Send messages
   - Receive messages
   - Typing indicators
   - Read receipts
   - Auto-mark as read

---

## Quick Start

1. Have Postman open with your API calls ready
2. Have 2 browser tabs open with Socket.io code in console
3. Test HTTP endpoints in Postman
4. Test real-time in browser tabs
5. Watch both work together!

**This is the proper way to test a full-stack chat app.**
