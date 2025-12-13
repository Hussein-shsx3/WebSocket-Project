# Socket.io Testing with Postman - FIXED ✅

## ✅ Issue Fixed!

The middleware now **decodes the JWT token** to extract userId automatically. You no longer need to pass userId separately!

---

## How to Test in Postman Now

### Step 1: Get Your JWT Token

**In Postman:**
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cmj477rfp0003gafssh6tvn7b",
      "name": "Alice"
    }
  }
}

Save: token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
Save: conversationId (from create conversation response)
```

---

### Step 2: Connect in Postman WebSocket

**In Postman:**

1. Click **"Connect"** button (for WebSocket)
2. Enter URL: `http://localhost:5000`
3. Go to **"Headers"** tab
4. Add header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. Click **"Connect"**

**Expected:**
```
✅ Connected successfully
```

---

### Step 3: Send Socket.io Events

**Send conversation:open:**
```
In the message input field, type:
conversation:open {"conversationId":"conv-123"}

Or better, send as JSON:
{
  "event": "conversation:open",
  "data": "conv-123"
}
```

**Send message:send:**
```
{
  "event": "message:send",
  "data": {
    "conversationId": "conv-123",
    "content": "Hi Bob!",
    "type": "TEXT"
  }
}
```

---

## ✅ What Changed

**Before (BROKEN):**
```javascript
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;  // ❌ Looking for userId in auth
  if (!userId) return next(new Error("userId not provided"));
});
```

**After (FIXED):**
```javascript
io.use((socket, next) => {
  try {
    // Get token from auth.token OR Authorization header
    let token = socket.handshake.auth.token;
    
    if (!token && socket.handshake.headers.authorization) {
      // Extract from "Bearer <token>"
      const authHeader = socket.handshake.headers.authorization;
      token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    }

    // ✅ Verify and decode the JWT
    const decoded = verifyAccessToken(token);
    
    if (!decoded.userId) {
      return next(new Error("userId not found in token"));
    }

    // ✅ Extract userId from decoded token
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    socket.data.role = decoded.role;

    next();
  } catch (error: any) {
    return next(new Error(`Authentication failed: ${error.message}`));
  }
});
```

---

## How It Works Now

```
Postman sends authorization header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ↓
Server middleware extracts token
    ↓
Server decodes JWT: { userId: "abc123", email: "alice@..." }
    ↓
✅ socket.data.userId = "abc123"
    ↓
✅ Connection successful
```

---

## Testing Both Ways

### Option 1: Postman WebSocket (Raw)

**Pros:**
- All in one tool
- Can see request/response history
- Good for HTTP + WebSocket testing

**Cons:**
- Socket.io protocol is complex to test manually
- Limited event support

### Option 2: Browser Console (Recommended)

**Pros:**
- Native Socket.io support
- Real-time events work perfectly
- See all console logs
- Easy to test

**Cons:**
- Need to open 2 tabs

---

## ✅ Server Now Accepts

1. **Token in `auth.token`:**
   ```javascript
   io('http://localhost:5000', {
     auth: {
       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   })
   ```

2. **Token in `Authorization` header:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **No need for separate `userId`** - it's decoded from the token!

---

## ✅ Recommended: Use Browser Console

It's still **easier and better** to use the browser console because:

1. Socket.io library is already loaded
2. Events work perfectly
3. You can see all logs in real-time
4. No manual protocol encoding needed

**Updated code for browser:**

```javascript
// Alice's connection (no need for userId, just token!)
const aliceSocket = io('http://localhost:5000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});

aliceSocket.on('connect', () => {
  console.log('✅ ALICE CONNECTED');
  aliceSocket.emit('conversation:open', 'conv-123');
});

aliceSocket.on('message:received', (message) => {
  console.log('📨 Message received:', message);
});

function aliceSendMessage(content) {
  aliceSocket.emit('message:send', {
    conversationId: 'conv-123',
    content: content,
    type: 'TEXT'
  });
}
```

---

## ✅ Checklist

- [x] Server.ts updated with JWT decoding
- [x] Server rebuilds successfully
- [x] Server running on localhost:5000
- [x] Socket.io accepts Bearer token
- [x] No need for separate userId anymore
- [x] Ready for testing!

---

## Next Steps

1. **Use browser console** (easiest way)
2. **Or use Postman WebSocket** with Authorization header
3. **Send events** and watch server logs for connection confirmations
4. **Test messaging** between 2 users

**The server is ready!** 🚀
