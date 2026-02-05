import React from "react";
import Image from "next/image";

type UserStatus = "online" | "offline" | "away";

type UserListItemUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  status?: UserStatus;
};

type AvatarSize = "sm" | "md" | "lg";

interface UserListItemProps {
  user: UserListItemUser;
  containerClassName?: string;
  avatarClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  subtitle?: string | null;
  footer?: React.ReactNode;
  trailing?: React.ReactNode;
  showStatus?: boolean;
  avatarSize?: AvatarSize;
  onClick?: () => void;
  disabled?: boolean;
}

const getInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || "?";
};

const getAvatarSizeClasses = (size: AvatarSize) => {
  switch (size) {
    case "sm":
      return { container: "w-9 h-9", status: "w-2.5 h-2.5" };
    case "lg":
      return { container: "w-12 h-12", status: "w-3.5 h-3.5" };
    case "md":
    default:
      return { container: "w-11 h-11", status: "w-3 h-3" };
  }
};

export function UserListItem({
  user,
  containerClassName = "",
  avatarClassName = "",
  titleClassName = "",
  subtitleClassName = "",
  subtitle,
  footer,
  trailing,
  showStatus = false,
  avatarSize = "sm",
  onClick,
  disabled = false,
}: UserListItemProps) {
  const initials = getInitials(user.name || null);
  const isOnline = user.status === "online";
  const sizeClasses = getAvatarSizeClasses(avatarSize);

  const content = (
    <>
      {/* Avatar with status */}
      <div className="relative flex-shrink-0">
        <div
          className={`rounded-full overflow-hidden ${sizeClasses.container} ${avatarClassName}`}
        >
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "User"}
              fill
              className="object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primaryColor to-primaryColor/70 flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
          )}
        </div>
        {showStatus && isOnline && (
          <span
            className={`absolute bottom-0 right-0 bg-green-500 border-2 border-panel rounded-full ${sizeClasses.status}`}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4
          className={`font-medium text-sm text-primary truncate ${titleClassName}`}
        >
          {user.name || "Unknown"}
        </h4>
        {(subtitle || user.email) && (
          <p
            className={`text-xs text-secondary truncate ${subtitleClassName}`}
          >
            {subtitle || user.email}
          </p>
        )}
        {footer}
      </div>

      {/* Trailing */}
      {trailing && <div className="flex items-center">{trailing}</div>}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${containerClassName}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg ${containerClassName}`}
    >
      {content}
    </div>
  );
}