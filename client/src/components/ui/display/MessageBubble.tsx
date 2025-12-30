// client/src/components/ui/display/MessageBubble.tsx

import { UserAvatar } from "./UserAvatar";
import { MessageStatus } from "./MessageStatus";
import { formatMessageTime } from "@/utils/message.utils";
import type { Message } from "@/types/chat.types";
import type { MessageStatusType } from "./MessageStatus";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showStatus?: boolean;
}

/**
 * Message Bubble Component
 * Displays a single message with avatar, content, time, and status
 *
 * - isOwn: true = sent by current user (right side, blue)
 * - isOwn: false = received from other user (left side, grey)
 * - showAvatar: display user avatar (typically for first message in group)
 * - showStatus: show delivery status (only for own messages)
 */
export const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  showStatus = true,
}: MessageBubbleProps) => {
  const time = formatMessageTime(message.createdAt);

  // Determine message status
  const getMessageStatus = (): MessageStatusType => {
    // If message has a status field, use it
    if ("status" in message && message.status) {
      return message.status as MessageStatusType;
    }

    // Fallback logic based on message properties
    if (message.isEdited) return "DELIVERED";
    return "SENT";
  };

  return (
    <div
      className={`flex gap-1 items-center ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar (left side for received messages) */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0">
          <UserAvatar
            user={{
              id: message.sender.id,
              name: message.sender.name || "",
              email: "",
              avatar: message.sender.avatar || null,
              status: "offline",
            }}
            size="sm"
            showStatus={false}
          />
        </div>
      )}

      {/* Spacer when avatar is hidden (for message grouping) */}
      {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}

      {/* Message Content */}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-primaryColor text-white rounded-br-sm"
            : "bg-muted text-primary rounded-bl-sm"
        }`}
      >
        {/* Message Text */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Media Content */}
        {message.mediaUrls && message.mediaUrls.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.mediaUrls.map((url, index) => (
              <div key={index} className="rounded-lg overflow-hidden max-w-sm">
                {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                  />
                ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={url}
                    controls
                    className="w-full h-auto max-h-64"
                    preload="metadata"
                  />
                ) : (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline text-sm break-all"
                    >
                      📎 Attachment {index + 1}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Time and Status */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 ${
            isOwn ? "text-white/70" : "text-secondary"
          }`}
        >
          <span className="text-xs">{time}</span>

          {/* Show status only for own messages */}
          {isOwn && showStatus && <MessageStatus status={getMessageStatus()} />}

          {/* Show edited indicator */}
          {message.isEdited && (
            <span className="text-xs opacity-70 ml-1">(edited)</span>
          )}
        </div>
      </div>

      {/* Spacer for own messages to align properly */}
      {isOwn && <div className="w-2 flex-shrink-0" />}
    </div>
  );
};
