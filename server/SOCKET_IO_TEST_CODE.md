# Socket.io Code for 2-Tab Testing

## Before You Start
1. ✅ Register Alice & Bob (save their tokens and IDs)
2. ✅ Make them friends (Alice requests, Bob accepts)
3. ✅ Create conversation between them (save conversationId)
4. Open **2 browser tabs**
5. Press **F12** to open DevTools
6. Go to **Console** tab
7. Paste the code below for each user

---

## 📋 Your Variables (REPLACE THESE!)

**Get these from your Postman API calls:**

```javascript
// From Registration/Login responses
ALICE_TOKEN = "your_alice_jwt_token_here";
ALICE_ID = "your_alice_user_id_here";

BOB_TOKEN = "your_bob_jwt_token_here";
BOB_ID = "your_bob_user_id_here";

CONVERSATION_ID = "your_conversation_id_here";
```

**Example from Postman:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clqv5c2xy0000..."
    }
  }
}
```

---

## 🔗 TAB 1: ALICE's Socket.io Code

**Open Tab 1 in your browser → F12 → Console → Paste this:**

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

// Connection established
aliceSocket.on('connect', () => {
  console.log('✅ ALICE CONNECTED - Socket ID:', aliceSocket.id);
  console.log('👋 Alice is joining conversation...');
  
  // Join conversation room
  aliceSocket.emit('conversation:open', CONVERSATION_ID);
  console.log('🚪 Alice opened conversation');
});

// Listen for messages from Bob
aliceSocket.on('message:received', (message) => {
  console.log('📨 ALICE RECEIVED MESSAGE:', message);
  console.log('✅ Auto-marked as READ');
});

// Listen for read receipts (when Bob reads Alice's message)
aliceSocket.on('message:read', (data) => {
  console.log('👀 Bob read your message:', data.messageId);
  console.log('⏰ Read at:', data.readAt);
});

// Listen for typing indicator
aliceSocket.on('user:typing', (data) => {
  if (data.isTyping) {
    console.log('✍️ Bob is typing...');
  } else {
    console.log('🛑 Bob stopped typing');
  }
});

// Listen for errors
aliceSocket.on('error', (error) => {
  console.error('❌ ALICE ERROR:', error);
});

// Connection error
aliceSocket.on('connect_error', (error) => {
  console.error('❌ ALICE CONNECTION ERROR:', error.message);
});

// Disconnected
aliceSocket.on('disconnect', () => {
  console.log('❌ ALICE DISCONNECTED');
});

// ===== ALICE'S ACTIONS =====
// Copy and paste these into console to send messages:

// 1️⃣ SEND MESSAGE FROM ALICE
function aliceSendMessage(content) {
  aliceSocket.emit('message:send', {
    conversationId: CONVERSATION_ID,
    content: content,
    type: 'TEXT'
  });
  console.log('📤 Alice sent:', content);
}

// 2️⃣ ALICE SHOWS TYPING
function aliceTypingStart() {
  aliceSocket.emit('typing:start', CONVERSATION_ID);
  console.log('✍️ Alice started typing...');
}

// 3️⃣ ALICE STOPS TYPING
function aliceTypingStop() {
  aliceSocket.emit('typing:stop', CONVERSATION_ID);
  console.log('🛑 Alice stopped typing');
}

// 4️⃣ ALICE CLOSES CONVERSATION
function aliceCloseConversation() {
  aliceSocket.emit('conversation:close', CONVERSATION_ID);
  console.log('👋 Alice closed conversation');
}

// ===== READY TO USE =====
console.log('✅ Alice setup complete!');
console.log('');
console.log('📝 ALICE COMMANDS:');
console.log('  aliceSendMessage("Hello Bob!")');
console.log('  aliceTypingStart()');
console.log('  aliceTypingStop()');
console.log('  aliceCloseConversation()');
```

---

## 🔗 TAB 2: BOB's Socket.io Code

**Open Tab 2 in your browser → F12 → Console → Paste this:**

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

// Connection established
bobSocket.on('connect', () => {
  console.log('✅ BOB CONNECTED - Socket ID:', bobSocket.id);
  console.log('👋 Bob is joining conversation...');
  
  // Join conversation room
  bobSocket.emit('conversation:open', CONVERSATION_ID);
  console.log('🚪 Bob opened conversation');
});

// Listen for messages from Alice
bobSocket.on('message:received', (message) => {
  console.log('📨 BOB RECEIVED MESSAGE:', message);
  console.log('✅ Auto-marked as READ');
});

// Listen for read receipts (when Alice reads Bob's message)
bobSocket.on('message:read', (data) => {
  console.log('👀 Alice read your message:', data.messageId);
  console.log('⏰ Read at:', data.readAt);
});

// Listen for typing indicator
bobSocket.on('user:typing', (data) => {
  if (data.isTyping) {
    console.log('✍️ Alice is typing...');
  } else {
    console.log('🛑 Alice stopped typing');
  }
});

// Listen for errors
bobSocket.on('error', (error) => {
  console.error('❌ BOB ERROR:', error);
});

// Connection error
bobSocket.on('connect_error', (error) => {
  console.error('❌ BOB CONNECTION ERROR:', error.message);
});

// Disconnected
bobSocket.on('disconnect', () => {
  console.log('❌ BOB DISCONNECTED');
});

// ===== BOB'S ACTIONS =====
// Copy and paste these into console to send messages:

// 1️⃣ SEND MESSAGE FROM BOB
function bobSendMessage(content) {
  bobSocket.emit('message:send', {
    conversationId: CONVERSATION_ID,
    content: content,
    type: 'TEXT'
  });
  console.log('📤 Bob sent:', content);
}

// 2️⃣ BOB SHOWS TYPING
function bobTypingStart() {
  bobSocket.emit('typing:start', CONVERSATION_ID);
  console.log('✍️ Bob started typing...');
}

// 3️⃣ BOB STOPS TYPING
function bobTypingStop() {
  bobSocket.emit('typing:stop', CONVERSATION_ID);
  console.log('🛑 Bob stopped typing');
}

// 4️⃣ BOB CLOSES CONVERSATION
function bobCloseConversation() {
  bobSocket.emit('conversation:close', CONVERSATION_ID);
  console.log('👋 Bob closed conversation');
}

// ===== READY TO USE =====
console.log('✅ Bob setup complete!');
console.log('');
console.log('📝 BOB COMMANDS:');
console.log('  bobSendMessage("Hi Alice!")');
console.log('  bobTypingStart()');
console.log('  bobTypingStop()');
console.log('  bobCloseConversation()');
```

---

## 🎬 Testing Steps

### Step 1: Prepare Both Tabs
```
Tab 1: Paste Alice code
  ↓ Press Enter
  ↓ See: ✅ ALICE CONNECTED
  ↓ See: 🚪 Alice opened conversation

Tab 2: Paste Bob code
  ↓ Press Enter
  ↓ See: ✅ BOB CONNECTED
  ↓ See: 🚪 Bob opened conversation
```

### Step 2: Alice Sends Message
**In Tab 1 Console, type:**
```javascript
aliceSendMessage("Hi Bob! How are you?")
```

**Expected:**
- Tab 1: `📤 Alice sent: Hi Bob! How are you?`
- Tab 2: `📨 BOB RECEIVED MESSAGE: {content: "Hi Bob! How are you?", ...}`
- Tab 2: `✅ Auto-marked as READ`

### Step 3: Bob Sends Message
**In Tab 2 Console, type:**
```javascript
bobSendMessage("Hi Alice! I'm doing great!")
```

**Expected:**
- Tab 2: `📤 Bob sent: Hi Alice! I'm doing great!`
- Tab 1: `📨 ALICE RECEIVED MESSAGE: {content: "Hi Alice! I'm doing great!", ...}`
- Tab 1: `✅ Auto-marked as READ`

### Step 4: Test Typing Indicator
**In Tab 1 Console, type:**
```javascript
aliceTypingStart()
```

**Expected:**
- Tab 1: `✍️ Alice started typing...`
- Tab 2: `✍️ Alice is typing...`

**Wait 2 seconds, then in Tab 1 Console:**
```javascript
aliceTypingStop()
```

**Expected:**
- Tab 1: `🛑 Alice stopped typing`
- Tab 2: `🛑 Alice stopped typing`

### Step 5: Send More Messages
**In Tab 1:**
```javascript
aliceSendMessage("What's your name?")
```

**In Tab 2:**
```javascript
bobSendMessage("My name is Bob")
```

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to Socket.io"
```
❌ Error: Failed to connect
  
Solution:
1. Make sure server is running: node dist/server.js
2. Check URL: http://localhost:5000 (not /socket.io/)
3. Check token: Is it valid? Copy exact value from Postman
4. Check userId: Is it correct? Must be from same login response
```

### Problem: "401 Unauthorized"
```
❌ Error: Unauthorized

Solution:
1. Token is expired or invalid
2. Re-login in Postman to get fresh token
3. Copy exact token (including JWT prefix if any)
4. Paste in ALICE_TOKEN / BOB_TOKEN variable
```

### Problem: "User not found in conversation"
```
❌ Error: You are not part of this conversation

Solution:
1. Make sure both users are friends first
2. Make sure conversation was created between these 2 users
3. Check CONVERSATION_ID is correct (copy from Postman response)
```

### Problem: "Messages not auto-marked as read"
```
✅ Verify:
1. Both users MUST be connected (look for ✅ CONNECTED)
2. Both users MUST emit 'conversation:open'
3. Message WILL auto-mark as read when received

If still not working:
- Check server logs: npm run dev
- Look for "Auto-marked messages as read" log
```

---

## 📊 What You Should See

**Console Output in Both Tabs:**

```
✅ ALICE CONNECTED - Socket ID: abc123
👋 Alice is joining conversation...
🚪 Alice opened conversation
✅ Alice setup complete!

📝 ALICE COMMANDS:
  aliceSendMessage("Hello Bob!")
  aliceTypingStart()
  aliceTypingStop()
  aliceCloseConversation()
```

---

## 💡 Tips

1. **Keep DevTools open** in both tabs so you can see logs
2. **Arrange windows side-by-side** - Tab 1 on left, Tab 2 on right
3. **Copy-paste carefully** - Make sure all quotes are correct
4. **Replace YOUR values** - Don't forget to change TOKEN, ID, CONVERSATION_ID
5. **Watch the console** - All real-time events will appear there

---

## ✅ Checklist Before Testing

- [ ] Server running on localhost:5000
- [ ] Alice registered in Postman (token saved)
- [ ] Bob registered in Postman (token saved)
- [ ] Alice & Bob are friends
- [ ] Conversation created between them (conversationId saved)
- [ ] 2 browser tabs open
- [ ] DevTools (F12) open in both tabs
- [ ] Token variables replaced with real values
- [ ] userId variables replaced with real values
- [ ] conversationId variable replaced with real value
- [ ] Ready to test! ✅
