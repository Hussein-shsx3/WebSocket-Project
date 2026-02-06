"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PathHeader from "@/components/ui/display/PathHeader";
import { UserListItem } from "@/components/ui/display/UserListItem";
import { useConversations, useGetOrCreateConversation } from "@/hooks/useConversations";
import { useFriendsList } from "@/hooks/useFriends";
import { ConversationListItem } from "@/services/conversations.service";
import { Friend } from "@/services/friends.service";
import { MessageSquare, Users, Search } from "lucide-react";

type TabType = "conversations" | "friends";

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else if (diffInHours < 168) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

interface ConversationItemProps {
  conversation: ConversationListItem;
  onClick: () => void;
}

const ConversationItem = ({ conversation, onClick }: ConversationItemProps) => {
  const { otherUser, lastMessage, unreadCount, updatedAt } = conversation;

  return (
    <UserListItem
      user={{
        ...otherUser,
        status: otherUser.status,
      }}
      onClick={onClick}
      showStatus
      avatarSize="md"
      containerClassName="p-3 hover:bg-hover rounded-xl"
      titleClassName="text-[13px]"
      subtitleClassName="text-[11px]"
      subtitle={lastMessage?.content || "Start a conversation"}
      trailing={
        <div className="flex flex-col items-end gap-1">
          {lastMessage && (
            <span className="text-[10px] text-secondary">
              {formatTime(lastMessage.createdAt || updatedAt)}
            </span>
          )}
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-primaryColor text-white text-[10px] font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      }
    />
  );
};

interface FriendItemProps {
  friend: Friend;
  onClick: () => void;
  isLoading?: boolean;
}

const FriendItem = ({ friend, onClick, isLoading }: FriendItemProps) => {
  const isOnline = friend.status === "online";

  return (
    <UserListItem
      user={{
        id: friend.id,
        name: friend.name,
        email: friend.email,
        avatar: friend.avatar,
        status: friend.status,
      }}
      onClick={onClick}
      disabled={isLoading}
      showStatus
      avatarSize="md"
      containerClassName="p-3 hover:bg-hover rounded-xl"
      titleClassName="text-[13px]"
      subtitleClassName="text-[11px]"
      subtitle={friend.bio || friend.email}
      trailing={
        <span
          className={`text-[10px] font-medium px-2 py-1 rounded-full ${
            isOnline
              ? "bg-green-500/10 text-green-500"
              : "bg-secondary/10 text-secondary"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      }
    />
  );
};

const Chats = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("conversations");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: conversations, isLoading: isConversationsLoading } = useConversations();
  const { data: friends, isLoading: isFriendsLoading } = useFriendsList();

  // Mutations
  const getOrCreateConversation = useGetOrCreateConversation();

  // Filter conversations based on search
  const filteredConversations = conversations?.filter((conv) =>
    conv.otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter friends based on search
  const filteredFriends = friends?.filter((friend) =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chats/${conversationId}`);
  };

  const handleFriendClick = (friendId: string) => {
    getOrCreateConversation.mutate(
      { friendId },
      {
        onSuccess: (data) => {
          router.push(`/chats/${data.conversation.id}`);
        },
      }
    );
  };

  const isLoading = activeTab === "conversations" ? isConversationsLoading : isFriendsLoading;

  return (
    <div className="flex flex-col h-full">
      <PathHeader PageName="Messages" />

      {/* Search Bar */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryColor/50 focus:border-primaryColor text-primary placeholder-secondary transition-all duration-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-panel px-3">
        <button
          onClick={() => setActiveTab("conversations")}
          className={`flex w-[50%] justify-center items-center gap-2 px-4 py-3 text-xs font-medium transition-all duration-200 relative ${
            activeTab === "conversations"
              ? "text-primaryColor"
              : "text-secondary hover:text-primary"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chats
          {activeTab === "conversations" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primaryColor rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("friends")}
          className={`flex w-[50%] justify-center items-center gap-2 px-4 py-3 text-xs font-medium transition-all duration-200 relative ${
            activeTab === "friends"
              ? "text-primaryColor"
              : "text-secondary hover:text-primary"
          }`}
        >
          <Users className="w-4 h-4" />
          Friends
          {friends && friends.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primaryColor/10 text-primaryColor rounded-full">
              {friends.length}
            </span>
          )}
          {activeTab === "friends" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primaryColor rounded-full" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primaryColor border-t-transparent" />
            <p className="text-xs text-secondary mt-3">Loading...</p>
          </div>
        )}

        {/* Conversations Tab */}
        {!isLoading && activeTab === "conversations" && (
          <>
            {filteredConversations && filteredConversations.length > 0 ? (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    onClick={() => handleConversationClick(conversation.id)}
                  />
                ))}
              </div>
            ) : searchQuery ? (
              <EmptyState
                icon={<Search className="w-10 h-10" />}
                title="No results found"
                description="Try searching with a different name"
              />
            ) : (
              <EmptyState
                icon={<MessageSquare className="w-10 h-10" />}
                title="No conversations yet"
                description="Start chatting with your friends to see conversations here"
              />
            )}
          </>
        )}

        {/* Friends Tab */}
        {!isLoading && activeTab === "friends" && (
          <>
            {filteredFriends && filteredFriends.length > 0 ? (
              <div className="space-y-1">
                {filteredFriends.map((friend) => (
                  <FriendItem
                    key={friend.id}
                    friend={friend}
                    onClick={() => handleFriendClick(friend.id)}
                    isLoading={getOrCreateConversation.isPending}
                  />
                ))}
              </div>
            ) : searchQuery ? (
              <EmptyState
                icon={<Search className="w-10 h-10" />}
                title="No results found"
                description="Try searching with a different name"
              />
            ) : (
              <EmptyState
                icon={<Users className="w-10 h-10" />}
                title="No friends yet"
                description="Add friends to start chatting with them"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-secondary">
    <div className="opacity-40 mb-3">{icon}</div>
    <h4 className="text-sm font-medium text-primary mb-1">{title}</h4>
    <p className="text-xs text-center max-w-[200px]">{description}</p>
  </div>
);

export default Chats;
