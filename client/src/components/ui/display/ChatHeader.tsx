// client/src/components/ui/display/ChatHeader.tsx

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Video, MoreVertical, Info } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import type { ConversationUser } from "@/services/conversations.service";

interface ChatHeaderProps {
  user: ConversationUser;
  showBackButton?: boolean;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
}

/**
 * Chat Header Component
 * Modern, sleek design with smooth animations
 * Supports dark/light mode with proper theming
 */
export const ChatHeader = ({
  user,
  showBackButton = true,
  onVoiceCall,
  onVideoCall,
}: ChatHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/chats");
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-panel/80 backdrop-blur-sm sticky top-0 z-10">
      {/* Back Button (Mobile) */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="md:hidden p-2 -ml-2 hover:bg-hover rounded-xl transition-all duration-200 active:scale-95"
          title="Back to chats"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
      )}

      {/* User Avatar with pulse animation for online */}
      <div className="relative group">
        <UserAvatar user={user} size="md" showStatus={true} />
        {user.status === "online" && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 rounded-full border-2 border-panel animate-pulse" />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-primary truncate leading-tight">
          {user.name || user.email}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            user.status === "online" 
              ? "text-success-500" 
              : "text-secondary"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              user.status === "online" ? "bg-success-500" : "bg-secondary/50"
            }`} />
            {user.status === "online" ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Voice Call */}
        <button
          onClick={onVoiceCall}
          className="p-2.5 text-secondary hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl transition-all duration-200 active:scale-95"
          title="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Video Call */}
        <button
          onClick={onVideoCall}
          className="p-2.5 text-secondary hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl transition-all duration-200 active:scale-95"
          title="Video call"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* More Options */}
        <button
          className="p-2.5 text-secondary hover:text-primary hover:bg-hover rounded-xl transition-all duration-200 active:scale-95"
          title="More options"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};