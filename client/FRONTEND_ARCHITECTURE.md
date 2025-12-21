# Frontend Architecture & Integration Guide

## Overview

This document outlines the client-side architecture for the Doot chat application, including service layers, hooks, and component integration patterns.

---

## Service Layer Architecture

### 1. Authentication Service (`services/auth.service.ts`)
**Purpose:** Handles user authentication, registration, and OAuth flows

**Key Methods:**
- `login()` - Email/password login
- `register()` - User registration
- `verifyEmail()` - Email verification
- `resendVerification()` - Resend verification email
- `requestPasswordReset()` - Request password reset
- `resetPassword()` - Reset password with token
- `initiateGoogleAuth()` - Start Google OAuth flow

**Used By:** `useAuth.ts` hook

**Pattern:**
```typescript
// Service returns typed responses extracted from API response
async login(data: LoginRequest): Promise<AuthResponse> {
  const response = await axiosInstance.post(url, data);
  return response.data.data; // Extract from { success, message, data }
}
```

---

### 2. Friends Service (`services/friends.service.ts`)
**Purpose:** Handles all friend-related operations

**Key Methods:**
- `sendFriendRequest()` - Send friend request to user
- `acceptFriendRequest()` - Accept incoming request
- `rejectFriendRequest()` - Reject request
- `cancelFriendRequest()` - Cancel sent request
- `getPendingRequests()` - Get incoming requests
- `getSentRequests()` - Get sent requests
- `getFriends()` - Get friends list
- `removeFriend()` - Remove friend

**Used By:** `useFriends.ts` hooks

**Pattern:**
```typescript
// Service handles API calls and response extraction
// Hooks wrap service calls with React Query
```

---

### 3. Conversations Service (`services/conversations.service.ts`)
**Purpose:** Handles conversation management

**Key Methods:**
- `getOrCreateConversation()` - Get or create conversation with friend
- `getConversations()` - Get all user conversations
- `getConversation()` - Get single conversation
- `getOtherUser()` - Get other user in conversation
- `archiveConversation()` - Archive conversation
- `unarchiveConversation()` - Unarchive conversation
- `deleteConversation()` - Delete conversation

**Used By:** `useConversations.ts` hooks

---

### 4. Messages Service (`services/messages.service.ts`)
**Purpose:** Handles message operations

**Key Methods:**
- `sendMessage()` - Send message in conversation
- `getMessages()` - Get messages in conversation
- `editMessage()` - Edit message content
- `deleteMessage()` - Delete message (soft delete)
- `markAsRead()` - Mark messages as read
- `getReadReceipts()` - Get read receipts for message
- `reactToMessage()` - Add emoji reaction
- `removeReaction()` - Remove reaction
- `getReactions()` - Get all reactions on message
- `searchMessages()` - Search messages in conversation

**Used By:** `useMessages.ts` hooks

---

## React Hooks Layer

### Query Hooks (Read Operations)

```typescript
// Get data that can be cached and refetched
const { data, isLoading, error } = useFriendsList();

// Features:
// - Automatic caching
// - Background refetching
// - Stale-while-revalidate pattern
// - Optimistic updates possible
```

### Mutation Hooks (Write Operations)

```typescript
// Perform mutations with callbacks
const mutation = useSendMessage();

mutation.mutate(data, {
  onSuccess: (result) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});
```

### Available Hooks

**Friends Hooks:**
- `useSendFriendRequest()` - Send request mutation
- `useAcceptFriendRequest()` - Accept request mutation
- `useRejectFriendRequest()` - Reject request mutation
- `useCancelFriendRequest()` - Cancel request mutation
- `usePendingFriendRequests()` - Query pending requests
- `useSentFriendRequests()` - Query sent requests
- `useFriendsList()` - Query friends list
- `useRemoveFriend()` - Remove friend mutation

**Conversation Hooks:**
- `useGetOrCreateConversation()` - Create/get conversation mutation
- `useConversations()` - Query all conversations
- `useConversation()` - Query single conversation
- `useConversationOtherUser()` - Query other user in conversation
- `useArchiveConversation()` - Archive conversation mutation
- `useUnarchiveConversation()` - Unarchive conversation mutation
- `useDeleteConversation()` - Delete conversation mutation

**Message Hooks:**
- `useSendMessage()` - Send message mutation
- `useMessages()` - Query messages in conversation
- `useEditMessage()` - Edit message mutation
- `useDeleteMessage()` - Delete message mutation
- `useMarkAsRead()` - Mark messages as read mutation
- `useReadReceipts()` - Query read receipts
- `useReactToMessage()` - React to message mutation
- `useRemoveReaction()` - Remove reaction mutation
- `useMessageReactions()` - Query message reactions
- `useSearchMessages()` - Search messages query

---

## Component Integration Pattern

### Step 1: Import Hook
```typescript
import { useConversations } from "@/hooks/useConversations";
import { useFriendsList } from "@/hooks/useFriends";
```

### Step 2: Use Hook in Component
```typescript
const MyComponent = () => {
  const { data: conversations, isLoading, error } = useConversations();
  const { data: friends } = useFriendsList();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {conversations?.map(conv => (
        <ConversationItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
};
```

### Step 3: Handle Mutations
```typescript
const ChatComponent = () => {
  const sendMessage = useSendMessage();
  const conversations = useConversations();

  const handleSendMessage = (content: string) => {
    sendMessage.mutate(
      {
        conversationId: "uuid",
        content,
      },
      {
        onSuccess: (data) => {
          console.log("Message sent:", data);
          // Invalidate cache to refetch messages
          queryClient.invalidateQueries({
            queryKey: ["messages", "uuid"],
          });
        },
      }
    );
  };

  return (
    <input
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          handleSendMessage(e.target.value);
        }
      }}
    />
  );
};
```

---

## Data Flow Architecture

### Query Flow (Reading Data)
```
Component → Hook (useConversations) 
  → React Query (caching/fetching)
    → Service (conversationsService)
      → Axios (HTTP request)
        → Backend API
          → Response
```

### Mutation Flow (Writing Data)
```
Component (handleSubmit)
  → Mutation Hook (useSendMessage)
    → React Query Mutation
      → Service (messagesService)
        → Axios (HTTP request)
          → Backend API
            → Response
              → onSuccess callback
                → Invalidate queries
                → Update UI
```

---

## Error Handling Pattern

### Service Layer
```typescript
// Services throw errors naturally
try {
  const response = await axiosInstance.get(url);
  return response.data.data;
} catch (error) {
  // Axios interceptor handles 401 (token refresh)
  // Other errors bubble up to hooks
  throw error;
}
```

### Hook Layer
```typescript
useQuery({
  queryFn: () => friendsService.getFriends(),
  onError: (error) => {
    console.error("Fetch failed:", error);
    // Can add toast notification here
  },
});
```

### Component Layer
```typescript
const { data, error, isLoading } = useFriends();

if (error) {
  return <ErrorAlert message={error.message} />;
}
```

---

## Caching & Invalidation Strategy

### Query Keys
```typescript
// Format: [resource, params]
["friends"]
["friendRequests", "pending"]
["conversations", { limit: 50, offset: 0 }]
["messages", conversationId]
["readReceipts", messageId]
```

### Invalidation
```typescript
// After mutation, invalidate related queries
const mutation = useSendMessage();

mutation.mutate(data, {
  onSuccess: () => {
    // Refetch messages in this conversation
    queryClient.invalidateQueries({
      queryKey: ["messages", conversationId],
    });
    
    // Refetch conversations list
    queryClient.invalidateQueries({
      queryKey: ["conversations"],
    });
  },
});
```

---

## Real-time Integration (Socket.IO)

### Planned Socket.IO Events

**Friends:**
- `friendRequestReceived` - New friend request received
- `friendAdded` - Friend request accepted
- `friendRemoved` - Friend removed

**Conversations:**
- `newMessage` - New message in conversation
- `messageEdited` - Message was edited
- `messageDeleted` - Message was deleted
- `conversationArchived` - Conversation archived
- `conversationDeleted` - Conversation deleted

**Messages:**
- `messagesRead` - Messages marked as read by other user
- `userTyping` - Other user is typing
- `userStoppedTyping` - Other user stopped typing

**User Status:**
- `userStatusChanged` - User online/offline/away status changed

### Integration Pattern
```typescript
// Example: Listen for new messages
useEffect(() => {
  socket.on("newMessage", (message) => {
    // Update cache with new message
    queryClient.setQueryData(
      ["messages", conversationId],
      (old) => {
        return {
          ...old,
          messages: [...old.messages, message],
        };
      }
    );
  });

  return () => {
    socket.off("newMessage");
  };
}, [conversationId]);
```

---

## State Management Summary

### Where State Lives

**React Query (Queries):**
- Conversations list
- Messages in conversation
- Friends list
- Friend requests
- User profile

**React Query (Mutations):**
- Sending messages
- Accepting friend requests
- Creating conversations

**Local Component State:**
- Form inputs
- UI state (dropdowns, modals)
- Temporary UI flags

**Not Used:**
- Redux (complexity not needed)
- Context (React Query handles caching)

---

## Implementation Checklist

For each new feature, follow this checklist:

- [ ] Create service file in `services/`
  - [ ] Define TypeScript interfaces
  - [ ] Implement API methods
  - [ ] Extract data from response structure

- [ ] Create hooks file in `hooks/`
  - [ ] Create query hooks for reads
  - [ ] Create mutation hooks for writes
  - [ ] Add error logging

- [ ] Create/Update component
  - [ ] Import needed hooks
  - [ ] Handle loading state
  - [ ] Handle error state
  - [ ] Render data
  - [ ] Call mutations on user action

- [ ] Test integration
  - [ ] Mock API responses
  - [ ] Test success paths
  - [ ] Test error handling
  - [ ] Test cache invalidation

---

## File Structure Reference

```
src/
├── services/
│   ├── auth.service.ts
│   ├── friends.service.ts
│   ├── conversations.service.ts
│   ├── messages.service.ts
│   └── users.service.ts (planned)
│
├── hooks/
│   ├── useAuth.ts
│   ├── useFriends.ts
│   ├── useConversations.ts
│   ├── useMessages.ts
│   └── useUsers.ts (planned)
│
├── components/
│   ├── pages/
│   │   ├── auth/
│   │   └── main/
│   │       ├── chats/
│   │       ├── friends/
│   │       ├── contacts/
│   │       └── calls/
│   ├── ui/
│   │   ├── form/
│   │   ├── buttons/
│   │   └── navigation/
│   └── layout/
│
├── lib/
│   └── axios.ts (configured with interceptors)
│
└── types/
    └── index.ts
```

---

## Next Steps

1. **Update Chats Component**
   - Replace mock data with `useConversations()` hook
   - Use `useSendMessage()` for sending messages
   - Remove hardcoded chat list

2. **Create Friends Components**
   - Friends List page using `useFriendsList()`
   - Friend Requests page using `usePendingFriendRequests()`
   - Add friend button using `useSendFriendRequest()`

3. **Integrate Socket.IO**
   - Create Socket.IO context provider
   - Listen for real-time events
   - Update query cache on socket events
   - Implement typing indicators

4. **Add Message Features**
   - Message search using `useSearchMessages()`
   - Message reactions using `useReactToMessage()`
   - Message edit/delete using `useEditMessage()` and `useDeleteMessage()`

5. **Implement Call System**
   - Create calls.service.ts and useCall hooks
   - Call initiation and management
   - Call history viewing

