"use client";

import { UserSearchResult } from "@/services/user.service";
import { UserAvatar } from "./UserAvatar";
import Button from "../form/Button";
import { UserPlus2 } from "lucide-react";

interface UserSearchResultCardProps {
  user: UserSearchResult;
  onSendRequest: () => void;
  isLoading: boolean;
}

export function UserSearchResultCard({
  user,
  onSendRequest,
  isLoading,
}: UserSearchResultCardProps) {
  // Create a user object for UserAvatar
  const userForAvatar = {
    id: user.id,
    name: user.name || "Unknown User",
    email: user.email,
    avatar: user.avatar,
    status: "online" as const,
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-surface hover:bg-surface/80 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <UserAvatar
          user={userForAvatar}
          size="sm"
          className="flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary truncate">
            {user.name}
          </p>
          <p className="text-xs text-secondary truncate">
            @{user.email}
          </p>
        </div>
      </div>
      <Button
        onClick={onSendRequest}
        disabled={isLoading}
        className="flex items-center py-1 text-xs ml-2"
        variant="primary"
        fullWidth={false}
      >
        <UserPlus2 className="w-4 h-4" />
        <span className="ml-1">Add</span>
      </Button>
    </div>
  );
}