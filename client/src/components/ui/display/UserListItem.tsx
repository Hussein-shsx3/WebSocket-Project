import React from "react";
import { Avatar } from "./Avatar";

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
  const content = (
    <>
      {/* Avatar with status */}
      <Avatar
        src={user.avatar}
        name={user.name}
        size={avatarSize}
        showStatus={showStatus}
        status={user.status}
        className={avatarClassName}
      />

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