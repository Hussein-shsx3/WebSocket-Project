"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Video, MoreVertical, UserX, User } from "lucide-react";
import { Avatar } from "@/components/ui/display/Avatar";
import { useRemoveFriend } from "@/hooks/useFriends";
import { useDeleteConversation } from "@/hooks/useConversations";

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
  conversationId?: string;
  isLoading?: boolean;
  isTyping?: boolean;
  onCallClick?: () => void;
  onVideoClick?: () => void;
}



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
  conversationId,
  isLoading = false,
  isTyping = false,
  onCallClick,
  onVideoClick,
}: ChatHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const removeFriendMutation = useRemoveFriend();
  const deleteConversationMutation = useDeleteConversation();
  const isOnline = user?.status === "online";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemoveFriend = () => {
    if (!user?.id) return;
    if (confirm(`Are you sure you want to remove ${user.name || "this user"} from your friends? This will also delete the conversation.`)) {
      // First delete the conversation, then remove the friend
      if (conversationId) {
        deleteConversationMutation.mutate(conversationId, {
          onSuccess: () => {
            removeFriendMutation.mutate(user.id, {
              onSuccess: () => {
                router.push("/chats");
              },
            });
          },
          onError: () => {
            // Even if conversation deletion fails, try to remove friend
            removeFriendMutation.mutate(user.id, {
              onSuccess: () => {
                router.push("/chats");
              },
            });
          },
        });
      } else {
        removeFriendMutation.mutate(user.id, {
          onSuccess: () => {
            router.push("/chats");
          },
        });
      }
    }
    setIsMenuOpen(false);
  };

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
            <Avatar
              src={user?.avatar}
              name={user?.name}
              size="md"
              showStatus={true}
              status={user?.status}
            />

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
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-xl hover:bg-hover transition-colors text-secondary hover:text-primary"
          >
            <MoreVertical className="w-[18px] h-[18px]" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute bg-sidebar top-[140%] right-0 mt-1 w-44 bg-popover rounded-xl border border-border shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => {
                  router.push(`/profile/${user?.id}`);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-primary hover:bg-hover transition-colors"
              >
                <User className="w-4 h-4 text-primaryColor" />
                View Profile
              </button>
              <div className="h-px bg-border mx-2" />
              <button
                onClick={handleRemoveFriend}
                disabled={removeFriendMutation.isPending}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <UserX className="w-4 h-4" />
                {removeFriendMutation.isPending ? "Removing..." : "Remove Friend"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
