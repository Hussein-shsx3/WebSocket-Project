"use client";

import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import PathHeader from "@/components/ui/display/PathHeader";
import { UserAvatar } from "@/components/ui/display/UserAvatar";
import { ConversationListItem } from "@/services/conversations.service";
import { formatDistanceToNow } from "date-fns";

const Chats = () => {
  const router = useRouter();
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
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <section className="h-full flex flex-col items-start p-4">
      <PathHeader PageName="Chats" />

      {isLoading && (
        <div className="w-full flex items-center justify-center py-8">
          <p className="text-sm text-secondary">Loading conversations...</p>
        </div>
      )}

      {error && (
        <div className="w-full flex items-center justify-center py-8">
          <p className="text-sm text-red-500">Error loading conversations</p>
        </div>
      )}

      {!isLoading && !error && conversations && conversations.length === 0 && (
        <div className="w-full flex items-center justify-center py-8">
          <p className="text-sm text-secondary">No conversations yet</p>
        </div>
      )}

      {!isLoading && !error && conversations && conversations.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          {conversations.map((conversation: ConversationListItem) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <UserAvatar
                user={conversation.otherUser}
                size="sm"
                showStatus={true}
              />

              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-primary truncate">
                    {conversation.otherUser.name ||
                      conversation.otherUser.email}
                  </p>
                  {conversation.lastMessage && (
                    <span className="text-xs text-secondary flex-shrink-0">
                      {formatLastMessageTime(
                        conversation.lastMessage.createdAt
                      )}
                    </span>
                  )}
                </div>

                {conversation.lastMessage ? (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-secondary truncate">
                      {conversation.lastMessage.senderId ===
                      conversation.otherUser.id
                        ? ""
                        : "You: "}
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-primaryColor rounded-full text-white text-xs font-semibold flex-shrink-0">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-secondary italic">
                    No messages yet
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Chats;
