// client/src/components/ui/display/ChatHeader.tsx

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import type { ConversationUser } from "@/services/conversations.service";

interface ChatHeaderProps {
  user: ConversationUser;
  isTyping?: boolean;
  showBackButton?: boolean;
}

/**
 * Chat Header Component
 * Displays user info, status, and action buttons
 * 
 * Features:
 * - User avatar and name
 * - Online/Offline status
 * - Typing indicator
 * - Action buttons (call, video, menu)
 * - Back button for mobile
 */
export const ChatHeader = ({
  user,
  isTyping = false,
  showBackButton = true,
}: ChatHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/chats");
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-panel">
      {/* Back Button (Mobile) */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="md:hidden p-1 hover:bg-muted rounded-lg transition-colors"
          title="Back to chats"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
      )}

      {/* User Avatar */}
      <UserAvatar user={user} size="md" showStatus={true} />

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-primary truncate">
          {user.name || user.email}
        </h3>
        <p className="text-xs text-secondary">
          {isTyping ? (
            <span className="flex items-center gap-1">
              <span className="animate-pulse">typing</span>
              <span className="animate-bounce">.</span>
              <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
            </span>
          ) : user.status === "online" ? (
            "Online"
          ) : (
            "Offline"
          )}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Voice Call */}
        <button
          className="p-2 text-secondary hover:text-primary hover:bg-muted rounded-lg transition-colors"
          title="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Video Call */}
        <button
          className="p-2 text-secondary hover:text-primary hover:bg-muted rounded-lg transition-colors"
          title="Video call"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* More Options */}
        <button
          className="p-2 text-secondary hover:text-primary hover:bg-muted rounded-lg transition-colors"
          title="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};