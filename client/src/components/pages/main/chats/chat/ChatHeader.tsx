"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";

// =====================================================
// TYPES
// =====================================================

interface ChatUser {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  status?: "online" | "offline" | "away";
}

interface ChatHeaderProps {
  user?: ChatUser | null;
  isLoading?: boolean;
  isTyping?: boolean;
  onCallClick?: () => void;
  onVideoClick?: () => void;
  onMenuClick?: () => void;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const getInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || "?";
};

// =====================================================
// LOADING SKELETON
// =====================================================

const HeaderSkeleton = () => (
  <div className="flex items-center gap-3">
    <div className="w-11 h-11 rounded-full bg-border animate-pulse" />
    <div className="space-y-2">
      <div className="w-28 h-4 bg-border rounded animate-pulse" />
      <div className="w-16 h-3 bg-border rounded animate-pulse" />
    </div>
  </div>
);

// =====================================================
// CHAT HEADER COMPONENT
// =====================================================

export function ChatHeader({
  user,
  isLoading = false,
  isTyping = false,
  onCallClick,
  onVideoClick,
  onMenuClick,
}: ChatHeaderProps) {
  const isOnline = user?.status === "online";

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-panel border-b border-border flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Back button (mobile) */}
        <Link
          href="/chats"
          className="md:hidden p-2 -ml-2 rounded-xl hover:bg-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </Link>

        {/* User info */}
        {isLoading ? (
          <HeaderSkeleton />
        ) : (
          <>
            {/* Avatar */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-border/50">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || "User"}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primaryColor to-primaryColor/70 flex items-center justify-center text-white font-semibold">
                    {getInitials(user?.name)}
                  </div>
                )}
              </div>
              {/* Online indicator */}
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-[2.5px] border-panel rounded-full" />
              )}
            </div>

            {/* Name and status */}
            <div>
              <h2 className="font-semibold text-[15px] text-primary leading-tight">
                {user?.name || "Unknown"}
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                {isTyping ? (
                  <span className="text-primaryColor font-medium">
                    typing...
                  </span>
                ) : isOnline ? (
                  <span className="text-green-500">Online</span>
                ) : (
                  "Offline"
                )}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onCallClick}
          className="p-2.5 rounded-xl hover:bg-hover transition-colors text-secondary hover:text-primary"
        >
          <Phone className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={onVideoClick}
          className="p-2.5 rounded-xl hover:bg-hover transition-colors text-secondary hover:text-primary"
        >
          <Video className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl hover:bg-hover transition-colors text-secondary hover:text-primary"
        >
          <MoreVertical className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
