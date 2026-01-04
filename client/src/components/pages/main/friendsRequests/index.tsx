"use client";

import React, { useState } from "react";
import { Search, Check, X, UserPlus, Clock, Users, Loader2, UserPlus2 } from "lucide-react";
import {
  usePendingFriendRequests,
  useSentFriendRequests,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
  useSendFriendRequest,
  useFriendsList,
} from "@/hooks/useFriends";
import { userService, UserSearchResult } from "@/services/user.service";
import type { FriendRequest } from "@/services/friends.service";
import { UserAvatar } from "@/components/ui/display/UserAvatar";
import { UserSearchResultCard } from "@/components/ui/display/UserSearchResultCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * Friends Requests Page
 * Modern design with tabs for incoming and sent requests
 */
const FriendsRequests = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "sent" | "search">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Queries
  const { data: pendingRequests = [], isLoading: pendingLoading } =
    usePendingFriendRequests();
  const { data: sentRequests = [], isLoading: sentLoading } =
    useSentFriendRequests();
  const { data: friends = [] } = useFriendsList();
  const currentUser = useCurrentUser();

  // Mutations
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const sendFriendRequest = useSendFriendRequest();

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await userService.searchUsers(query, 10);

      // Filter out current user and existing friends
      const filteredResults = results.filter((user) => {
        // Exclude current user
        if (user.id === currentUser?.userId) {
          return false;
        }

        // Exclude existing friends
        const isFriend = friends.some((friend) => friend.id === user.id);
        if (isFriend) {
          return false;
        }

        // Exclude users with pending requests (both sent and received)
        const hasPendingRequest = [...pendingRequests, ...sentRequests].some(
          (request) => request.senderId === user.id || request.receiverId === user.id
        );

        if (hasPendingRequest) {
          return false;
        }

        return true;
      });

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return;
    }

    if (userId === currentUser?.userId) {
      return;
    }

    try {
      await sendFriendRequest.mutateAsync({ receiverId: userId });
      // Remove from search results or update status
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const activeRequests =
    activeTab === "pending" ? pendingRequests : activeTab === "sent" ? sentRequests : [];

  const isLoading = pendingLoading || sentLoading;

  return (
    <section className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-primary">Friends</h1>
            <p className="text-xs text-secondary">
              {pendingRequests.length} pending • {sentRequests.length} sent
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-panel rounded-xl mb-3">
          <button
            onClick={() => {
              setActiveTab("pending");
              setSearchQuery("");
              setSearchResults([]);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === "pending"
                ? "bg-primaryColor text-white shadow-sm"
                : "text-secondary hover:text-primary"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Incoming</span>
            {pendingRequests.length > 0 && (
              <span className={` rounded-full text-xs ${
                activeTab === "pending"
                  ? "text-white"
                  : "text-primaryColor"
              }`}>
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("sent");
              setSearchQuery("");
              setSearchResults([]);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === "sent"
                ? "bg-primaryColor text-white shadow-sm"
                : "text-secondary hover:text-primary"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sent</span>
            {sentRequests.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === "sent"
                  ? "bg-white/20 text-white"
                  : "bg-primaryColor/20 text-primaryColor"
              }`}>
                {sentRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === "search"
                ? "bg-primaryColor text-white shadow-sm"
                : "text-secondary hover:text-primary"
            }`}
          >
            <UserPlus2 className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Search Input for Add Friends Tab */}
        {activeTab === "search" && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              placeholder="Search users to add..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-input-bg border border-border rounded-lg text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primaryColor/50 focus:border-primaryColor transition-all"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === "search" ? (
          /* Search Results */
          isSearching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primaryColor animate-spin mb-3" />
              <p className="text-xs text-secondary">Searching...</p>
            </div>
          ) : searchResults.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                <Search className="w-8 h-8 text-secondary/50" />
              </div>
              <h3 className="text-sm font-semibold text-primary mb-1">
                No users found
              </h3>
              <p className="text-xs text-secondary max-w-xs leading-tight">
                Try searching with a different name or email.
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-3">
                {searchResults.length} user{searchResults.length !== 1 ? "s" : ""} found
              </p>
              {searchResults.map((user) => (
                <UserSearchResultCard
                  key={user.id}
                  user={user}
                  onSendRequest={() => {
                    console.log("Send request clicked for user:", user);
                    handleSendFriendRequest(user.id);
                  }}
                  isLoading={sendFriendRequest.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                <UserPlus2 className="w-8 h-8 text-secondary/50" />
              </div>
              <h3 className="text-sm font-semibold text-primary mb-1">
                Find friends
              </h3>
              <p className="text-xs text-secondary max-w-xs leading-tight">
                Search for users by name or email to send friend requests.
              </p>
            </div>
          )
        ) : (
          /* Friend Requests */
          isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primaryColor animate-spin mb-3" />
              <p className="text-xs text-secondary">Loading...</p>
            </div>
          ) : activeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                <UserPlus className="w-8 h-8 text-secondary/50" />
              </div>
              <h3 className="text-sm font-semibold text-primary mb-1">
                {activeTab === "pending" ? "No requests" : "No sent requests"}
              </h3>
              <p className="text-xs text-secondary max-w-xs leading-tight">
                {activeTab === "pending"
                  ? "Friend requests will appear here."
                  : "Sent requests will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeRequests.map((request: FriendRequest) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  isIncoming={activeTab === "pending"}
                  onAccept={() => acceptRequest.mutate(request.id)}
                  onReject={() => rejectRequest.mutate(request.id)}
                  onCancel={() => cancelRequest.mutate(request.id)}
                  isLoading={
                    acceptRequest.isPending ||
                    rejectRequest.isPending ||
                    cancelRequest.isPending
                  }
                />
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
};

interface FriendRequestCardProps {
  request: FriendRequest;
  isIncoming: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function FriendRequestCard({
  request,
  isIncoming,
  onAccept,
  onReject,
  onCancel,
  isLoading,
}: FriendRequestCardProps) {
  // For incoming requests, show the sender. For sent requests, show the receiver.
  const user = isIncoming ? request.sender : request.receiver;

  if (!user) return null;

  const userForAvatar = {
    id: user.id || "",
    name: user.name || "Unknown User",
    email: user.email || "",
    avatar: user.avatar || null,
    status: "offline" as const,
  };

  return (
    <div className="bg-panel rounded-xl p-3 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <UserAvatar user={userForAvatar} size="sm" showStatus={false} />

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-primary truncate">
            {user.name || "Unknown User"}
          </h3>
          <p className="text-xs text-secondary truncate">{user.email}</p>
          <p className="text-[10px] text-secondary/70 mt-0.5">
            {isIncoming ? "Wants to be friends" : "Request sent"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isIncoming ? (
            <>
              <button
                onClick={onAccept}
                disabled={isLoading}
                className="w-8 h-8 rounded-lg bg-success-500 hover:bg-success-600 text-white flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Accept request"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onReject}
                disabled={isLoading}
                className="w-8 h-8 rounded-lg bg-error-500/10 hover:bg-error-500 text-error-500 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Decline request"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-error-500/10 hover:bg-error-500 text-error-500 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cancel request"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendsRequests;
