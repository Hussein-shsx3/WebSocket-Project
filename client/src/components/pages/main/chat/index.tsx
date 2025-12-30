"use client";

import { useParams } from "next/navigation";
import { useConversationOtherUser } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { UserAvatar } from "@/components/ui/display/UserAvatar";
import type { Message } from "@/services/messages.service";
import { useEffect, useMemo, useRef } from "react";

type ChatProps = {
  conversationId?: string | null;
};

const Chat = ({ conversationId: propConversationId }: ChatProps) => {
  const params = useParams();
  const routeConversationId = params?.conversationId as string | undefined;
  const conversationId = propConversationId ?? routeConversationId;

  const {
    data: otherUser,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useConversationOtherUser(conversationId || null);

  const { data: messages, isLoading: isLoadingMessages } = useMessages(
    conversationId || "",
    50,
    0
  );

  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Ensure messages are ordered oldest -> newest for display
  const sortedMessages = useMemo(() => {
    if (!messages) return [] as Message[];
    return [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      // Scroll to bottom smoothly
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [sortedMessages.length]);

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-secondary">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  if (isLoadingUser || isLoadingMessages) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-secondary">Loading messages...</p>
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-red-500">Failed to load user information</p>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-red-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-main">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <UserAvatar user={otherUser} size="md" showStatus={true} />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-primary">
            {otherUser.name || otherUser.email}
          </h3>
          <p className="text-xs text-secondary">
            {otherUser.status === "online" ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" ref={messagesRef}>
        {!sortedMessages || sortedMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-secondary">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedMessages.map((message: Message) => {
              const isOtherUserMessage = message.sender.id === otherUser.id;
              return (
                <div
                  key={message.id}
                  className={`flex items-end ${
                    isOtherUserMessage ? "justify-start" : "justify-end"
                  }`}
                >
                  {isOtherUserMessage && (
                    <div className="mr-3">
                      <UserAvatar
                        user={{
                          id: message.sender.id,
                          name: message.sender.name,
                          email: "",
                          avatar: message.sender.avatar || null,
                          status: "offline",
                        }}
                        size="sm"
                        showStatus={false}
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOtherUserMessage
                        ? "bg-muted text-primary"
                        : "bg-primaryColor text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOtherUserMessage ? "text-secondary" : "text-white/70"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {!isOtherUserMessage && (
                    <div className="ml-3" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-search-bg border border-border rounded-lg text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primaryColor/30"
          />
          <button className="px-4 py-2 bg-primaryColor text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
