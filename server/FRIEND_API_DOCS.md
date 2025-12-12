# Friend Request System - API Documentation

## Overview
Complete friend request system. Frontend determines relationship status by checking existing data from friends list and friend requests.

---

## 🎯 How to Determine Friendship Status in Frontend

**No separate status endpoint needed!** Use existing endpoints to check status:

### Method 1: Check when loading user lists
When you fetch friends list and pending requests on app load:

```typescript
// On app initialization
const [friends, sentRequests, receivedRequests] = await Promise.all([
  fetch('/api/v1/friends'),
  fetch('/api/v1/friends/requests/sent'),
  fetch('/api/v1/friends/requests/pending')
]);

// Store in state/context for quick lookup
const friendsMap = new Map(friends.data.friends.map(f => [f.id, 'friends']));
const sentRequestsMap = new Map(sentRequests.data.requests.map(r => [r.receiverId, r.id]));
const receivedRequestsMap = new Map(receivedRequests.data.requests.map(r => [r.senderId, r.id]));

// Check status for any user
function getFriendshipStatus(userId) {
  if (friendsMap.has(userId)) {
    return { status: 'friends' };
  }
  if (sentRequestsMap.has(userId)) {
    return { status: 'request_sent', requestId: sentRequestsMap.get(userId) };
  }
  if (receivedRequestsMap.has(userId)) {
    return { status: 'request_received', requestId: receivedRequestsMap.get(userId) };
  }
  return { status: 'none' };
}
```

### Method 2: Update status locally after actions
When user sends/accepts/cancels requests, update local state immediately:

```typescript
async function sendFriendRequest(userId) {
  const response = await fetch('/api/v1/friends/request', {
    method: 'POST',
    body: JSON.stringify({ receiverId: userId })
  });
  
  const { data } = await response.json();
  
  // Update local state
  sentRequestsMap.set(userId, data.id);
  
  // Show "Cancel Request" button
  updateUIButton(userId, 'request_sent', data.id);
}
```

### Button Logic:

1. **`none`** - No relationship
   - Show: "Send Friend Request" button
   - Action: `POST /api/v1/friends/request`

2. **`request_sent`** - You sent a request (pending)
   - Show: "Cancel Request" button
   - Action: `DELETE /api/v1/friends/request/:requestId`

3. **`request_received`** - They sent you a request (pending)
   - Show: "Accept" and "Reject" buttons
   - Actions:
     - Accept: `PATCH /api/v1/friends/request/:requestId/accept`
     - Reject: `PATCH /api/v1/friends/request/:requestId/reject`

4. **`friends`** - Already friends
   - Show: "Remove Friend" or "Message" button
   - Action: `DELETE /api/v1/friends/:friendId`

---

## 📋 All Friend Endpoints

### 1. **Send Friend Request**
```
POST /api/v1/friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "user-id-here"
}
```

**Response:**
```json
{
  "message": "Friend request sent successfully",
  "data": {
    "id": "request-id",
    "senderId": "your-id",
    "receiverId": "their-id",
    "status": "PENDING",
    "createdAt": "2025-12-12T10:00:00Z",
    "sender": {
      "id": "your-id",
      "name": "Your Name",
      "email": "your@email.com",
      "avatar": "avatar-url"
    },
    "receiver": {
      "id": "their-id",
      "name": "Their Name",
      "email": "their@email.com",
      "avatar": "avatar-url"
    }
  }
}
```

---

### 2. **Accept Friend Request**
```
PATCH /api/v1/friends/request/:requestId/accept
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Friend request accepted successfully",
  "data": {
    "request": {
      "id": "request-id",
      "status": "ACCEPTED",
      "createdAt": "2025-12-12T10:00:00Z"
    },
    "friendship": {
      "id": "friendship-id",
      "userId": "user1-id",
      "friendId": "user2-id",
      "createdAt": "2025-12-12T10:05:00Z"
    }
  }
}
```

---

### 3. **Reject Friend Request**
```
PATCH /api/v1/friends/request/:requestId/reject
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Friend request rejected successfully",
  "data": {
    "id": "request-id",
    "status": "REJECTED",
    "updatedAt": "2025-12-12T10:10:00Z"
  }
}
```

---

### 4. **Cancel Sent Friend Request**
```
DELETE /api/v1/friends/request/:requestId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Friend request cancelled successfully"
}
```

---

### 5. **Get Pending Friend Requests (Received)**
```
GET /api/v1/friends/requests/pending?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Pending friend requests retrieved successfully",
  "data": {
    "requests": [
      {
        "id": "request-id",
        "senderId": "sender-id",
        "receiverId": "your-id",
        "status": "PENDING",
        "createdAt": "2025-12-12T10:00:00Z",
        "sender": {
          "id": "sender-id",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "avatar-url",
          "bio": "Hello there"
        }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

---

### 6. **Get Sent Friend Requests**
```
GET /api/v1/friends/requests/sent?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Sent friend requests retrieved successfully",
  "data": {
    "requests": [
      {
        "id": "request-id",
        "senderId": "your-id",
        "receiverId": "receiver-id",
        "status": "PENDING",
        "createdAt": "2025-12-12T10:00:00Z",
        "receiver": {
          "id": "receiver-id",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": "avatar-url",
          "bio": "Software Engineer"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 7. **Get All Friends**
```
GET /api/v1/friends?page=1&limit=10&search=john
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "message": "Friends retrieved successfully",
  "data": {
    "friends": [
      {
        "id": "friend-id",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "avatar-url",
        "bio": "Full stack developer",
        "status": "ONLINE"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

---

### 8. **Remove Friend**
```
DELETE /api/v1/friends/:friendId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Friend removed successfully"
}
```

---

## 🎨 Frontend Implementation Example

```typescript
// Initialize data on app load
let friendsMap = new Map();
let sentRequestsMap = new Map();
let receivedRequestsMap = new Map();

async function initializeFriendData() {
  const [friends, sentRequests, receivedRequests] = await Promise.all([
    fetch('/api/v1/friends', { headers: { Authorization: `Bearer ${token}` } }),
    fetch('/api/v1/friends/requests/sent', { headers: { Authorization: `Bearer ${token}` } }),
    fetch('/api/v1/friends/requests/pending', { headers: { Authorization: `Bearer ${token}` } })
  ]);
  
  const friendsData = await friends.json();
  const sentData = await sentRequests.json();
  const receivedData = await receivedRequests.json();
  
  // Build lookup maps
  friendsMap = new Map(friendsData.data.friends.map(f => [f.id, f]));
  sentRequestsMap = new Map(sentData.data.requests.map(r => [r.receiverId, r.id]));
  receivedRequestsMap = new Map(receivedData.data.requests.map(r => [r.senderId, r.id]));
}

// Get status for any user
function getFriendshipStatus(userId) {
  if (friendsMap.has(userId)) {
    return { status: 'friends', friendId: userId };
  }
  if (sentRequestsMap.has(userId)) {
    return { status: 'request_sent', requestId: sentRequestsMap.get(userId) };
  }
  if (receivedRequestsMap.has(userId)) {
    return { status: 'request_received', requestId: receivedRequestsMap.get(userId) };
  }
  return { status: 'none' };
}

// Show appropriate button based on status
function renderFriendButton(userId) {
  const { status, requestId, friendId } = getFriendshipStatus(userId);
  
  switch(status) {
    case 'none':
      return <Button onClick={() => sendFriendRequest(userId)}>Send Friend Request</Button>;
    
    case 'request_sent':
      return <Button onClick={() => cancelRequest(requestId)}>Cancel Request</Button>;
    
    case 'request_received':
      return (
        <>
          <Button onClick={() => acceptRequest(requestId)}>Accept</Button>
          <Button onClick={() => rejectRequest(requestId)}>Reject</Button>
        </>
      );
    
    case 'friends':
      return (
        <>
          <Button onClick={() => openChat(userId)}>Message</Button>
          <Button onClick={() => removeFriend(friendId)}>Remove Friend</Button>
        </>
      );
  }
}

// Send friend request and update local state
async function sendFriendRequest(receiverId) {
  const response = await fetch('/api/v1/friends/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ receiverId })
  });
  
  const { data } = await response.json();
  
  // Update local state immediately
  sentRequestsMap.set(receiverId, data.id);
  
  // Re-render button
  renderFriendButton(receiverId);
}

// Cancel request and update local state
async function cancelRequest(requestId) {
  await fetch(`/api/v1/friends/request/${requestId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Find and remove from map
  for (let [userId, id] of sentRequestsMap.entries()) {
    if (id === requestId) {
      sentRequestsMap.delete(userId);
      renderFriendButton(userId);
      break;
    }
  }
}
```

---

## ✅ Summary

**Total Friend Endpoints: 8**

1. ✅ Send friend request
2. ✅ Accept friend request
3. ✅ Reject friend request
4. ✅ Cancel sent request
5. ✅ Get pending requests (received)
6. ✅ Get sent requests
7. ✅ Get all friends (with search)
8. ✅ Remove friend

**Key Benefits:**
- ✅ Efficient - Load data once, check locally
- ✅ Fast UI - No extra API calls to check status
- ✅ Real-time updates - Update local state after actions
- ✅ Pagination support for all list endpoints
- ✅ Search functionality for friends list
- ✅ Proper error handling and validation

**Next Steps:**
1. Test endpoints in Postman
2. Build frontend with local state management
3. Implement real-time notifications for friend requests (WebSocket)
```
POST /api/v1/friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "user-id-here"
}
```

**Response:**
```json
{
  "message": "Friend request sent successfully",
  "data": {
    "id": "request-id",
    "senderId": "your-id",
    "receiverId": "their-id",
    "status": "PENDING",
    "createdAt": "2025-12-12T10:00:00Z",
    "sender": {
      "id": "your-id",
      "name": "Your Name",
      "email": "your@email.com",
      "avatar": "avatar-url"
    },
    "receiver": {
      "id": "their-id",
      "name": "Their Name",
      "email": "their@email.com",
      "avatar": "avatar-url"
    }
  }
}
```

---

### 3. **Accept Friend Request**
```
PATCH /api/v1/friends/request/:requestId/accept
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Friend request accepted successfully",
  "data": {
    "request": {
      "id": "request-id",
      "status": "ACCEPTED",
      "createdAt": "2025-12-12T10:00:00Z"
    },
    "friendship": {
      "id": "friendship-id",
      "userId": "user1-id",
      "friendId": "user2-id",
      "createdAt": "2025-12-12T10:05:00Z"
    }
  }
}
```

---

### 4. **Reject Friend Request**
```
PATCH /api/v1/friends/request/:requestId/reject
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Friend request rejected successfully",
  "data": {
    "id": "request-id",
    "status": "REJECTED",
    "updatedAt": "2025-12-12T10:10:00Z"
  }
}
```

---

### 5. **Cancel Sent Friend Request**
```
DELETE /api/v1/friends/request/:requestId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Friend request cancelled successfully"
}
```

---

### 6. **Get Pending Friend Requests (Received)**
```
GET /api/v1/friends/requests/pending?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Pending friend requests retrieved successfully",
  "data": {
    "requests": [
      {
        "id": "request-id",
        "senderId": "sender-id",
        "receiverId": "your-id",
        "status": "PENDING",
        "createdAt": "2025-12-12T10:00:00Z",
        "sender": {
          "id": "sender-id",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "avatar-url",
          "bio": "Hello there"
        }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

---

### 7. **Get Sent Friend Requests**
```
GET /api/v1/friends/requests/sent?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Sent friend requests retrieved successfully",
  "data": {
    "requests": [
      {
        "id": "request-id",
        "senderId": "your-id",
        "receiverId": "receiver-id",
        "status": "PENDING",
        "createdAt": "2025-12-12T10:00:00Z",
        "receiver": {
          "id": "receiver-id",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": "avatar-url",
          "bio": "Software Engineer"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 8. **Get All Friends**
```
GET /api/v1/friends?page=1&limit=10&search=john
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "message": "Friends retrieved successfully",
  "data": {
    "friends": [
      {
        "id": "friend-id",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "avatar-url",
        "bio": "Full stack developer",
        "status": "ONLINE"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

---

### 9. **Remove Friend**
```
DELETE /api/v1/friends/:friendId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Friend removed successfully"
}
```

---

## 🎨 Frontend Implementation Example

```typescript
// Check friendship status when viewing a user profile
async function loadUserProfile(userId: string) {
  const statusResponse = await fetch(`/api/v1/friends/status/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const { data } = await statusResponse.json();
  
  // Show appropriate button based on status
  switch(data.status) {
    case 'self':
      showButton('Edit Profile');
      break;
    
    case 'none':
      showButton('Send Friend Request', () => {
        sendFriendRequest(userId);
      });
      break;
    
    case 'request_sent':
      showButton('Cancel Request', () => {
        cancelRequest(data.requestId);
      });
      break;
    
    case 'request_received':
      showButtons([
        { label: 'Accept', action: () => acceptRequest(data.requestId) },
        { label: 'Reject', action: () => rejectRequest(data.requestId) }
      ]);
      break;
    
    case 'friends':
      showButton('Remove Friend', () => {
        removeFriend(data.friendshipId);
      });
      showButton('Send Message', () => {
        openChat(userId);
      });
      break;
  }
}

// Send friend request
async function sendFriendRequest(receiverId: string) {
  await fetch('/api/v1/friends/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ receiverId })
  });
  
  // Refresh status
  loadUserProfile(receiverId);
}

// Cancel request
async function cancelRequest(requestId: string) {
  await fetch(`/api/v1/friends/request/${requestId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Update UI
  showButton('Send Friend Request');
}
```

---

## ✅ Summary

**Total Friend Endpoints: 9**

1. ✅ Check friendship status (NEW - solves your UX concern!)
2. ✅ Send friend request
3. ✅ Accept friend request
4. ✅ Reject friend request
5. ✅ Cancel sent request
6. ✅ Get pending requests (received)
7. ✅ Get sent requests
8. ✅ Get all friends (with search)
9. ✅ Remove friend

**Key Benefits:**
- ✅ No duplicate request errors - frontend always knows the status
- ✅ Dynamic UI - show correct button based on relationship
- ✅ Include requestId/friendshipId in status response for easy actions
- ✅ Pagination support for all list endpoints
- ✅ Search functionality for friends list
- ✅ Proper error handling and validation

**Next Steps:**
1. Test endpoints in Postman
2. Build frontend components with dynamic buttons
3. Implement real-time notifications for friend requests (WebSocket)
