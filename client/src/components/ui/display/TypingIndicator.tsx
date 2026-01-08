// client/src/components/ui/display/TypingIndicator.tsx

"use client";

import { UserAvatar } from "./UserAvatar";
import type { ConversationUser } from "@/services/conversations.service";

interface TypingIndicatorProps {
  user: ConversationUser;
}

/**
 * Typing Indicator Component
 * Modern animated design matching the chat bubble style
 */
export const TypingIndicator = ({ user }: TypingIndicatorProps) => {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      {/* Avatar */}
      <div className="transition-transform duration-200 hover:scale-105">
        <UserAvatar user={user} size="sm" showStatus={false} />
      </div>

      {/* Typing Bubble */}
      <div className="flex flex-col max-w-xs lg:max-w-md">
        {/* Message Bubble */}
        <div className="bg-panel dark:bg-header rounded-2xl rounded-bl-md px-4 py-3 border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primaryColor rounded-full animate-bounce typing-dot-1"></span>
              <span className="w-2 h-2 bg-primaryColor rounded-full animate-bounce typing-dot-2"></span>
              <span className="w-2 h-2 bg-primaryColor rounded-full animate-bounce typing-dot-3"></span>
            </div>
            <span className="text-xs text-secondary ml-1">typing...</span>
          </div>
        </div>
      </div>
    </div>
  );
};