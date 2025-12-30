// client/src/components/ui/display/MessagesList.tsx

"use client";

import { useEffect, useRef } from "react";
import { DateSeparator } from "./DateSeparator";
import { MessageGroup } from "./MessageGroup";
import { groupMessagesByDate } from "@/utils/message.utils";
import type { Message } from "@/services/messages.service";

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
}

/**
 * Messages List Component
 * Displays all messages grouped by date and sender
 * Auto-scrolls to bottom on new messages
 *
 * Features:
 * - Date separators (Today, Yesterday, etc.)
 * - Message grouping by sender
 * - Auto-scroll to bottom
 * - Loading state
 */
export const MessagesList = ({
  messages,
  currentUserId,
  isLoading = false,
}: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Group messages by date
  const messageGroups = groupMessagesByDate(messages);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Group consecutive messages from same sender
  const groupBySender = (messages: Message[]): Message[][] => {
    if (messages.length === 0) return [];

    const groups: Message[][] = [];
    let currentGroup: Message[] = [messages[0]];

    for (let i = 1; i < messages.length; i++) {
      const prevMessage = messages[i - 1];
      const currentMessage = messages[i];

      // Check if messages are from same sender and within 5 minutes
      const timeDiff =
        new Date(currentMessage.createdAt).getTime() -
        new Date(prevMessage.createdAt).getTime();
      const isSameSender = currentMessage.sender.id === prevMessage.sender.id;
      const isWithinTimeWindow = timeDiff < 5 * 60 * 1000; // 5 minutes

      if (isSameSender && isWithinTimeWindow) {
        currentGroup.push(currentMessage);
      } else {
        groups.push(currentGroup);
        currentGroup = [currentMessage];
      }
    }

    groups.push(currentGroup);
    return groups;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor mx-auto mb-2"></div>
          <p className="text-sm text-secondary">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messageGroups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-secondary">
            No messages yet. Start the conversation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
    >
      {messageGroups.map((dateGroup) => (
        <div key={dateGroup.date}>
          {/* Date Separator */}
          <DateSeparator label={dateGroup.dateLabel} />

          {/* Messages grouped by sender */}
          <div className="space-y-4">
            {groupBySender(dateGroup.messages).map((senderGroup, index) => (
              <MessageGroup
                key={`${dateGroup.date}-${index}`}
                messages={senderGroup}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};
