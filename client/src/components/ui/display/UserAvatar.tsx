"use client";

import Image from "next/image";
import { ConversationUser } from "@/services/conversations.service";

interface UserAvatarProps {
  user: ConversationUser;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  className?: string;
}

/**
 * Choose a background class from a small palette based on user ID
 * This avoids inline styles and maps the hashed ID to one of the
 * predefined CSS classes (declared in globals.css).
 */
const getAvatarClass = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Pick from 12 palette classes
  const paletteSize = 12;
  const index = Math.abs(hash) % paletteSize;
  return `avatar-bg-${index}`;
};

/**
 * Get initials from user name
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    // First letter of first name + first letter of last name
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    // Only one name, use first two letters
    return parts[0].substring(0, 2).toUpperCase();
  }
  // Fallback: use first two characters of email or "U"
  return "U";
};

/**
 * Get size classes
 */
const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return {
        container: "w-10 h-10",
        text: "text-xs",
        status: "w-3 h-3",
        statusPosition: "bottom-0 right-0",
        imageSize: 32,
      };
    case "lg":
      return {
        container: "w-16 h-16",
        text: "text-lg",
        status: "w-3.5 h-3.5",
        statusPosition: "bottom-1 right-1",
        imageSize: 64,
      };
    case "md":
    default:
      return {
        container: "w-10 h-10",
        text: "text-sm",
        status: "w-2.5 h-2.5",
        statusPosition: "bottom-0 right-0",
        imageSize: 40,
      };
  }
};

export function UserAvatar({
  user,
  size = "md",
  showStatus = true,
  className = "",
}: UserAvatarProps) {
  const sizeClasses = getSizeClasses(size);
  const isActive = user.status === "online";
  const avatarClass = getAvatarClass(user.id);
  const initials = user.name ? getInitials(user.name) : "U";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeClasses.container} ${className}`}
    >
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name || "User"}
          width={sizeClasses.imageSize}
          height={sizeClasses.imageSize}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div
          className={`rounded-full flex items-center justify-center ${sizeClasses.text} font-semibold text-white w-full h-full ${avatarClass}`}
        >
          {initials}
        </div>
      )}

      {/* Active status indicator */}
      {showStatus && isActive && (
        <div
          className={`absolute ${sizeClasses.statusPosition} ${sizeClasses.status} bg-green-500 rounded-full border-white border-2 border-sidebar`}
          title="Online"
        />
      )}
    </div>
  );
}
