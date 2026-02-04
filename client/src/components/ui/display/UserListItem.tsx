import React from "react";
import Image from "next/image";

type UserListItemUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

interface UserListItemProps {
  user: UserListItemUser;
  containerClassName?: string;
  avatarClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  footer?: React.ReactNode;
  trailing?: React.ReactNode;
}

const getInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || "?";
};

export function UserListItem({
  user,
  containerClassName = "",
  avatarClassName = "",
  titleClassName = "",
  subtitleClassName = "",
  footer,
  trailing,
}: UserListItemProps) {
  const initials = getInitials(user.name || null);

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg ${containerClassName}`}
    >
      <div
        className={`relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ${avatarClassName}`}
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name || "User"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primaryColor flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium text-sm text-primary truncate ${titleClassName}`}>
          {user.name || "Unknown"}
        </h4>
        {user.email && (
          <p className={`text-xs text-secondary truncate ${subtitleClassName}`}>
            {user.email}
          </p>
        )}
        {footer}
      </div>
      {trailing && <div className="flex items-center">{trailing}</div>}
    </div>
  );
}