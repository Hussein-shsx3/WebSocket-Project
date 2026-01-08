"use client";

import { useRouter, useParams } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import { UserAvatar } from "@/components/ui/display/UserAvatar";
import { ConversationListItem } from "@/services/conversations.service";
import { formatDistanceToNow } from "date-fns";
import { Search, MessageSquarePlus } from "lucide-react";

const Chats = () => {
  const router = useRouter();
  const params = useParams();
  const activeConversationId = params?.conversationId as string | undefined;
  const {
    data: conversations,
    isLoading,
    error,
  } = useConversations(50, 1, false);

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chats/${conversationId}`);
  };

  const formatLastMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return formatDistanceToNow(date, { addSuffix: false });
    } catch {
      return "";
    }
  };

  return (
    <section className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary">Chats</h1>
          <button 
            className="p-2 text-secondary hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl transition-all duration-200 active:scale-95"
            title="New chat"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-main border border-border rounded-xl text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primaryColor/20 focus:border-primaryColor/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading && (
          <div className="w-full flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primaryColor border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-secondary">Loading conversations...</p>
          </div>
        )}

        {error && (
          <div className="w-full flex items-center justify-center py-12">
            <p className="text-sm text-error-500">Error loading conversations</p>
          </div>
        )}

        {!isLoading && !error && conversations && conversations.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-main rounded-2xl flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-8 h-8 text-secondary" />
            </div>
            <p className="text-sm font-medium text-primary mb-1">No conversations yet</p>
            <p className="text-xs text-secondary">Start a new chat to get going</p>
          </div>
        )}

        {!isLoading && !error && conversations && conversations.length > 0 && (
          <div className="flex flex-col gap-1">
            {conversations.map((conversation: ConversationListItem) => {
              const isActive = conversation.id === activeConversationId;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={`group w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-primaryColor/10 border border-border' 
                      : 'hover:bg-hover border border-transparent'
                  }`}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <UserAvatar
                      user={conversation.otherUser}
                      size="md"
                      showStatus={false}
                    />
                    {conversation.otherUser.status === "online" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 rounded-full border-2 border-panel" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${
                        isActive ? 'text-primaryColor' : 'text-primary'
                      }`}>
                        {conversation.otherUser.name || conversation.otherUser.email}
                      </p>
                      {conversation.lastMessage && (
                        <span className={`text-2xs flex-shrink-0 ${
                          conversation.unreadCount > 0 ? 'text-primaryColor font-semibold' : 'text-secondary'
                        }`}>
                          {formatLastMessageTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      {conversation.lastMessage ? (
                        <p className="text-xs text-secondary truncate flex-1">
                          {conversation.lastMessage.senderId === conversation.otherUser.id
                            ? ""
                            : "You: "}
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-xs text-secondary/70 italic">
                          Start a conversation
                        </p>
                      )}
                      
                      {conversation.unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-primaryColor rounded-full text-white text-2xs font-bold flex-shrink-0 min-w-[20px] text-center">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Chats;
