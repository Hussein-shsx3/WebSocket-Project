"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useRouter } from "next/navigation";
import { AddButton } from "@/components/ui/buttons/AddButton";
import type { ConversationListItem } from "@/services/conversations.service";

const Chats = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: conversations = [], isLoading } = useConversations(50, 0);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv: ConversationListItem) =>
    conv.otherUser?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-panel">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-primary">Chats</h1>
          <AddButton size="md" title="Start new chat" />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-search-bg border-0 rounded-md text-xs text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primaryColor/30"
          />
        </div>
      </div>

      {/* Chat Lists */}
      <div className="flex-1 overflow-y-auto bg-panel">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-secondary">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-secondary">
              {conversations.length === 0
                ? "No conversations yet"
                : "No conversations match your search"}
            </p>
          </div>
        ) : (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
                Conversations ({filteredConversations.length})
              </h3>
              <AddButton size="sm" title="New conversation" />
            </div>
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  onClick={() => router.push(`/chats/${conversation.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

// Conversation Item Component
function ConversationItem({
  conversation,
  onClick,
}: {
  conversation: ConversationListItem;
  onClick: () => void;
}) {
  const otherUser = conversation.otherUser;
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount || 0;

  const getTimeString = (date: string) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return msgDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return msgDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-chat-hover transition-colors group"
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-primaryColor/20 flex items-center justify-center text-primaryColor text-xs font-semibold">
          {otherUser.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-sm font-medium text-primary truncate">
            {otherUser.name}
          </h4>
          {lastMessage && (
            <span className="text-[10px] text-secondary flex-shrink-0 ml-2">
              {getTimeString(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-secondary truncate">
          {lastMessage?.content || "No messages yet"}
        </p>
      </div>

      {/* Unread Badge */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {unreadCount > 0 && (
          <div className="min-w-[18px] h-[18px] px-1.5 bg-primaryColor rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white font-semibold leading-none">
              {unreadCount}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

export default Chats;
