// client/src/components/ui/display/MessageBubble.tsx

"use client";

import { useState } from "react";
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
 * Modern, sleek design with smooth animations
 * Supports dark/light mode with proper theming
 */
export const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  showStatus = true,
}: MessageBubbleProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const time = formatMessageTime(message.createdAt);

  // Determine message status
  const getMessageStatus = (): MessageStatusType => {
    if ("status" in message && message.status) {
      return message.status as MessageStatusType;
    }
    if (message.isEdited) return "DELIVERED";
    return "SENT";
  };

  return (
    <div
      className={`flex gap-2 items-end animate-fade-in ${
        isOwn ? "justify-end" : "justify-start"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar (left side for received messages) */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 mb-1 transition-transform duration-200 hover:scale-105">
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
        className={`group relative max-w-[75%] lg:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 ${
          isOwn
            ? "bg-gradient-to-br from-primaryColor to-primaryColor/90 text-white rounded-br-md hover:shadow-md"
            : "bg-panel dark:bg-header text-primary rounded-bl-md border border-border/50 hover:border-border"
        } ${isHovered ? 'scale-[1.01]' : ''}`}
      >
        {/* Message Text */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Media Content */}
        {message.mediaUrls && message.mediaUrls.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.mediaUrls.map((url, index) => (
              <div key={index} className="rounded-xl overflow-hidden max-w-sm transition-transform duration-200 hover:scale-[1.02]">
                {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-auto max-h-72 object-cover cursor-pointer transition-all duration-300 hover:brightness-95"
                    onClick={() => window.open(url, '_blank')}
                  />
                ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={url}
                    controls
                    className="w-full h-auto max-h-72 rounded-xl"
                    preload="metadata"
                  />
                ) : (
                  <div className={`p-3 rounded-xl flex items-center gap-2 ${
                    isOwn ? 'bg-white/10' : 'bg-main dark:bg-main'
                  }`}>
                    <span className="text-lg">📎</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium break-all hover:underline ${
                        isOwn ? 'text-white/90' : 'text-primaryColor'
                      }`}
                    >
                      Attachment {index + 1}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Time and Status */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-1.5 ${
            isOwn ? "text-white/60" : "text-secondary/70"
          }`}
        >
          {/* Show edited indicator */}
          {message.isEdited && (
            <span className="text-2xs italic">edited</span>
          )}

          <span className="text-2xs font-medium">{time}</span>

          {/* Show status only for own messages */}
          {isOwn && showStatus && (
            <div className="ml-0.5">
              <MessageStatus status={getMessageStatus()} />
            </div>
          )}
        </div>
      </div>

      {/* Spacer for own messages to align properly */}
      {isOwn && <div className="w-1 flex-shrink-0" />}
    </div>
  );
};
