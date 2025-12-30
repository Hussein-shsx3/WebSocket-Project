"use client";

import React, { useState } from "react";
import { Search, Check, X } from "lucide-react";
import {
  usePendingFriendRequests,
  useSentFriendRequests,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
} from "@/hooks/useFriends";
import type { FriendRequest } from "@/services/friends.service";
import PathHeader from "@/components/ui/display/PathHeader";

const FriendsRequests = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "sent">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: pendingRequests = [], isLoading: pendingLoading } =
    usePendingFriendRequests();
  const { data: sentRequests = [], isLoading: sentLoading } =
    useSentFriendRequests();

  // Mutations
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const cancelRequest = useCancelFriendRequest();

  const activeRequests =
    activeTab === "pending" ? pendingRequests : sentRequests;

  const filteredRequests = activeRequests.filter((req: FriendRequest) =>
    activeTab === "pending"
      ? req.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      : req.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-panel">
        <PathHeader PageName="Friends Requests" />

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-search-bg border-0 rounded-md text-xs text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primaryColor/30"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-panel sticky top-0">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-3 text-xs font-semibold transition-colors ${
            activeTab === "pending"
              ? "text-primaryColor border-b-2 border-primaryColor"
              : "text-secondary border-b-2 border-transparent hover:text-primary"
          }`}
        >
          Incoming
          {pendingRequests.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primaryColor/20 rounded-full text-primaryColor text-[10px]">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`flex-1 py-3 text-xs font-semibold transition-colors ${
            activeTab === "sent"
              ? "text-primaryColor border-b-2 border-primaryColor"
              : "text-secondary border-b-2 border-transparent hover:text-primary"
          }`}
        >
          Sent
          {sentRequests.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primaryColor/20 rounded-full text-primaryColor text-[10px]">
              {sentRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto bg-panel">
        {pendingLoading || sentLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-secondary">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-secondary">
              {activeTab === "pending"
                ? "No incoming requests"
                : "No sent requests"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredRequests.map((request: FriendRequest) => (
              <FriendRequestItem
                key={request.id}
                request={request}
                isIncoming={activeTab === "pending"}
                onAccept={() =>
                  acceptRequest.mutate(request.id, {
                    onSuccess: () => {
                      // Request accepted, you can show a toast or update UI
                    },
                  })
                }
                onReject={() =>
                  rejectRequest.mutate(request.id, {
                    onSuccess: () => {
                      // Request rejected
                    },
                  })
                }
                onCancel={() =>
                  cancelRequest.mutate(request.id, {
                    onSuccess: () => {
                      // Request cancelled
                    },
                  })
                }
                isLoading={
                  acceptRequest.isPending ||
                  rejectRequest.isPending ||
                  cancelRequest.isPending
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface FriendRequestItemProps {
  request: FriendRequest;
  isIncoming: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function FriendRequestItem({
  request,
  isIncoming,
  onAccept,
  onReject,
  onCancel,
  isLoading,
}: FriendRequestItemProps) {
  const user = isIncoming ? request.sender : request.sender;

  if (!user) return null;

  return (
    <div className="flex items-center justify-between p-2.5 rounded-md bg-chat-hover hover:bg-chat-hover/80 transition-colors">
      {/* User Info */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primaryColor/20 flex items-center justify-center text-primaryColor text-xs font-semibold flex-shrink-0">
          {user.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">
            {user.name}
          </p>
          <p className="text-[10px] text-secondary truncate">{user.email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isIncoming ? (
          <>
            <button
              onClick={onAccept}
              disabled={isLoading}
              className="w-7 h-7 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="Accept request"
            >
              <Check className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={onReject}
              disabled={isLoading}
              className="w-7 h-7 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reject request"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </>
        ) : (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-7 h-7 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
            title="Cancel request"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

export default FriendsRequests;
