// client/src/components/ui/display/MessageGroup.tsx

import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/types/chat.types";

interface MessageGroupProps {
  messages: Message[];
  currentUserId: string;
}

/**
 * Message Group Component
 * Groups consecutive messages from the same sender
 * Shows avatar only on the last message of the group
 *
 * This creates the "stacked" effect seen in WhatsApp/Messenger
 */
export const MessageGroup = ({
  messages,
  currentUserId,
}: MessageGroupProps) => {
  if (messages.length === 0) return null;

  const isOwnGroup = messages[0].sender.id === currentUserId;

  return (
    <div className="flex flex-col gap-1">
      {messages.map((message, index) => {
        const isLastInGroup = index === messages.length - 1;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwnGroup}
            showAvatar={isLastInGroup && !isOwnGroup}
            showStatus={isLastInGroup && isOwnGroup}
          />
        );
      })}
    </div>
  );
};
