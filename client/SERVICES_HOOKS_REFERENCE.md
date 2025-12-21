# Services & Hooks Quick Reference

## Services Overview

### Location & Structure
```
src/services/
├── auth.service.ts          ✅ Complete - Auth, registration, OAuth
├── friends.service.ts       ✅ NEW - Friend requests, friends list
├── conversations.service.ts ✅ NEW - Conversations management
├── messages.service.ts      ✅ NEW - Messages, reactions, search
└── users.service.ts         📋 Planned
```

### Hooks Overview
```
src/hooks/
├── useAuth.ts               ✅ Complete - Login, register, logout
├── useGoogleAuth.ts         ✅ Complete - Google OAuth
├── useFriends.ts            ✅ NEW - Friend operations
├── useConversations.ts      ✅ NEW - Conversation operations
└── useMessages.ts           ✅ NEW - Message operations
```

---

## Friends Service & Hook

### Service: `friendsService`

```typescript
import { friendsService } from "@/services/friends.service";

// Send friend request
await friendsService.sendFriendRequest({ recipientId: "uuid" });

// Get pending requests (incoming)
const { friendRequests } = await friendsService.getPendingRequests();

// Get sent requests (outgoing)
const { friendRequests } = await friendsService.getSentRequests();

// Accept request
await friendsService.acceptFriendRequest(requestId);

// Reject request
await friendsService.rejectFriendRequest(requestId);

// Cancel sent request
await friendsService.cancelFriendRequest(requestId);

// Get all friends
const { friends } = await friendsService.getFriends();

// Remove friend
await friendsService.removeFriend(friendId);
```

### Hooks: `useFriends`

```typescript
import {
  useSendFriendRequest,
  usePendingFriendRequests,
  useSentFriendRequests,
  useFriendsList,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend,
} from "@/hooks/useFriends";

// Query: Get pending requests
const { data: requests, isLoading } = usePendingFriendRequests();

// Query: Get friends list
const { data: friends } = useFriendsList();

// Mutation: Send request
const sendRequest = useSendFriendRequest();
sendRequest.mutate({ recipientId: "uuid" });

// Mutation: Accept request
const acceptRequest = useAcceptFriendRequest();
acceptRequest.mutate(requestId);

// Mutation: Reject request
const rejectRequest = useRejectFriendRequest();
rejectRequest.mutate(requestId);

// Mutation: Remove friend
const removeFriend = useRemoveFriend();
removeFriend.mutate(friendId);
```

---

## Conversations Service & Hook

### Service: `conversationsService`

```typescript
import { conversationsService } from "@/services/conversations.service";

// Get or create conversation
const { conversation } = await conversationsService.getOrCreateConversation({
  friendId: "uuid"
});

// Get all conversations
const { conversations, total } = await conversationsService.getConversations(
  limit = 50,
  offset = 0
);

// Get single conversation
const { conversation } = await conversationsService.getConversation(
  conversationId
);

// Get other user in conversation
const { user } = await conversationsService.getOtherUser(conversationId);

// Archive conversation
await conversationsService.archiveConversation({ conversationId });

// Unarchive conversation
await conversationsService.unarchiveConversation({ conversationId });

// Delete conversation
await conversationsService.deleteConversation({ conversationId });
```

### Hooks: `useConversations`

```typescript
import {
  useGetOrCreateConversation,
  useConversations,
  useConversation,
  useConversationOtherUser,
  useArchiveConversation,
  useUnarchiveConversation,
  useDeleteConversation,
} from "@/hooks/useConversations";

// Query: Get all conversations
const { data: conversations } = useConversations(limit, offset);

// Query: Get single conversation
const { data: conversation } = useConversation(conversationId);

// Query: Get other user
const { data: otherUser } = useConversationOtherUser(conversationId);

// Mutation: Create/get conversation
const createConversation = useGetOrCreateConversation();
createConversation.mutate(
  { friendId: "uuid" },
  {
    onSuccess: (data) => {
      router.push(`/chats/${data.conversation.id}`);
    },
  }
);

// Mutation: Archive
const archive = useArchiveConversation();
archive.mutate(conversationId);

// Mutation: Delete
const deleteConv = useDeleteConversation();
deleteConv.mutate(conversationId);
```

---

## Messages Service & Hook

### Service: `messagesService`

```typescript
import { messagesService } from "@/services/messages.service";

// Send message
const { message } = await messagesService.sendMessage({
  conversationId: "uuid",
  content: "Hello!",
});

// Get messages in conversation
const { messages, total } = await messagesService.getMessages(
  conversationId,
  limit = 50,
  offset = 0
);

// Edit message
await messagesService.editMessage({
  messageId: "uuid",
  content: "Updated message",
});

// Delete message (soft delete)
await messagesService.deleteMessage({ messageId: "uuid" });

// Mark as read
const { markedCount } = await messagesService.markAsRead({
  conversationId: "uuid",
  messageIds: ["uuid1", "uuid2"],
});

// Get read receipts
const readBy = await messagesService.getReadReceipts(messageId);

// React to message
const { reaction } = await messagesService.reactToMessage({
  messageId: "uuid",
  emoji: "👍",
});

// Remove reaction
await messagesService.removeReaction({ reactionId: "uuid" });

// Get reactions
const reactions = await messagesService.getReactions(messageId);

// Search messages
const { messages: results } = await messagesService.searchMessages(
  query = "hello",
  conversationId,
  limit = 20
);
```

### Hooks: `useMessages`

```typescript
import {
  useSendMessage,
  useMessages,
  useEditMessage,
  useDeleteMessage,
  useMarkAsRead,
  useReadReceipts,
  useReactToMessage,
  useRemoveReaction,
  useMessageReactions,
  useSearchMessages,
} from "@/hooks/useMessages";

// Query: Get messages
const { data: messages, isLoading } = useMessages(conversationId);

// Query: Get read receipts
const { data: readReceipts } = useReadReceipts(messageId);

// Query: Get reactions
const { data: reactions } = useMessageReactions(messageId);

// Query: Search messages
const { data: searchResults } = useSearchMessages(query, conversationId);

// Mutation: Send message
const sendMessage = useSendMessage();
sendMessage.mutate({
  conversationId: "uuid",
  content: "Hello!",
});

// Mutation: Edit message
const editMessage = useEditMessage();
editMessage.mutate({
  messageId: "uuid",
  content: "Updated",
});

// Mutation: Delete message
const deleteMessage = useDeleteMessage();
deleteMessage.mutate({ messageId: "uuid" });

// Mutation: Mark as read
const markAsRead = useMarkAsRead();
markAsRead.mutate({
  conversationId: "uuid",
  messageIds: ["uuid1", "uuid2"],
});

// Mutation: React
const reactToMessage = useReactToMessage();
reactToMessage.mutate({
  messageId: "uuid",
  emoji: "👍",
});

// Mutation: Remove reaction
const removeReaction = useRemoveReaction();
removeReaction.mutate({ reactionId: "uuid" });
```

---

## Common Usage Patterns

### Pattern 1: List with Loading
```typescript
const MyComponent = () => {
  const { data: items, isLoading, error } = useFriendsList();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;

  return (
    <div>
      {items?.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </div>
  );
};
```

### Pattern 2: Mutation with Callbacks
```typescript
const sendMessage = useSendMessage();

const handleSend = (content: string) => {
  sendMessage.mutate(
    { conversationId, content },
    {
      onSuccess: () => {
        // Refetch or update cache
        queryClient.invalidateQueries({
          queryKey: ["messages", conversationId],
        });
        // Reset form
        setContent("");
      },
      onError: (error) => {
        // Show error
        toast.error(error.message);
      },
    }
  );
};
```

### Pattern 3: Dependent Queries
```typescript
// Only fetch conversation when ID is available
const { data: conversation } = useConversation(conversationId);

// Only fetch messages when conversation is selected
const { data: messages } = useMessages(conversationId);
```

### Pattern 4: Pagination
```typescript
const [offset, setOffset] = useState(0);

const { data: conversations } = useConversations(50, offset);

const handleLoadMore = () => {
  setOffset((prev) => prev + 50);
};
```

---

## Error Handling

### In Service
Services throw errors naturally - no custom error handling needed.

### In Hooks
Hooks automatically pass errors to components via `error` property.

### In Component
```typescript
const { data, error, isLoading } = useFriendsList();

if (error) {
  return (
    <div className="text-red-500">
      {error?.message || "Failed to load friends"}
    </div>
  );
}
```

---

## Testing Patterns

### Mock Service
```typescript
jest.mock("@/services/friends.service", () => ({
  friendsService: {
    getFriends: jest.fn(() =>
      Promise.resolve({
        friends: [{ id: "1", name: "John" }],
      })
    ),
  },
}));
```

### Test Hook
```typescript
import { renderHook, waitFor } from "@testing-library/react";

test("useFriendsList loads friends", async () => {
  const { result } = renderHook(() => useFriendsList());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

---

## TypeScript Interfaces

### Friends
```typescript
interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  bio?: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  sender: Friend;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}
```

### Conversations
```typescript
interface Conversation {
  id: string;
  participants: ConversationUser[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
}
```

### Messages
```typescript
interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: { id: string; name: string };
  isRead: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}
```

---

## Troubleshooting

### Query not updating after mutation
**Solution:** Call `queryClient.invalidateQueries()` after successful mutation
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["friends"] });
}
```

### Loading never resolves
**Solution:** Check if query has `enabled: false` or is missing required parameters

### Type errors on response
**Solution:** Verify the service extracts correct data from API response structure

### Stale data showing
**Solution:** Manually invalidate cache or adjust staleTime in query options

