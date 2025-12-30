"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useConversationOtherUser } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { socketEmitters } from "@/socket/emitters";
import { ChatHeader } from "@/components/ui/display/ChatHeader";
import { MessagesList } from "@/components/ui/display/MessagesList";
import { MessageInput } from "@/components/ui/input/MessageInput";

type ChatProps = {
  conversationId?: string | null;
};

/**
 * Main Chat Component
 * Handles a single conversation view
 *
 * Features:
 * - Real-time messaging via Socket.IO
 * - Message grouping by date
 * - Typing indicators
 * - Read receipts
 * - Auto-scroll to bottom
 *
 * Architecture:
 * - ChatHeader: User info and actions
 * - MessagesList: Grouped messages with date separators
 * - MessageInput: Message composition and sending
 */
const Chat = ({ conversationId: propConversationId }: ChatProps) => {
  const params = useParams();
  const routeConversationId = params?.conversationId as string | undefined;
  const conversationId = propConversationId ?? routeConversationId;

  // Get current user from JWT
  const currentUser = useCurrentUser();

  // Fetch conversation data
  const {
    data: otherUser,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useConversationOtherUser(conversationId || null);

  const { data: messages = [], isLoading: isLoadingMessages } = useMessages(
    conversationId || "",
    50,
    0
  );

  // Socket.IO: Open conversation when component mounts
  useEffect(() => {
    if (!conversationId) return;

    // Emit conversation:open event
    socketEmitters.openConversation(conversationId);

    // Cleanup: Emit conversation:close event when unmounting
    return () => {
      socketEmitters.closeConversation(conversationId);
    };
  }, [conversationId]);

  // ============================================
  // LOADING & ERROR STATES
  // ============================================

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center bg-main">
        <div className="text-center">
          <p className="text-sm text-secondary">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingUser || isLoadingMessages) {
    return (
      <div className="h-full flex items-center justify-center bg-main">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor mx-auto mb-2"></div>
          <p className="text-sm text-secondary">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (isUserError || !otherUser) {
    return (
      <div className="h-full flex items-center justify-center bg-main">
        <div className="text-center">
          <p className="text-sm text-red-500">
            {isUserError ? "Failed to load user information" : "User not found"}
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-full flex items-center justify-center bg-main">
        <div className="text-center">
          <p className="text-sm text-red-500">
            Authentication required. Please sign in again.
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER CHAT
  // ============================================

  return (
    <div className="h-full flex flex-col bg-main pb-16 sm:pb-0">
      {/* Chat Header */}
      <ChatHeader
        user={otherUser}
        isTyping={false} // TODO: Get from typing state
      />

      {/* Messages List */}
      <MessagesList
        messages={messages}
        currentUserId={currentUser.userId}
        isLoading={false}
      />

      {/* Message Input */}
      <MessageInput
        conversationId={conversationId}
        onSendMessage={(content) => {
          console.log("Message sent:", content);
        }}
      />
    </div>
  );
};

export default Chat;
