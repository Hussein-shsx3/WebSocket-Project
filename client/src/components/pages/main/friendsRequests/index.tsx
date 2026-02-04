"use client";

import { useState } from "react";
import PathHeader from "@/components/ui/display/PathHeader";
import { useSearchUsers, useUserProfile } from "@/hooks/useUserProfile";
import {
  useSendFriendRequest,
  usePendingFriendRequests,
  useSentFriendRequests,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
  useFriendsList,
} from "@/hooks/useFriends";
import { UserListItem } from "@/components/ui/display/UserListItem";
import { Check, X } from "lucide-react";

const FriendsRequests = () => {
  const [activeTab, setActiveTab] = useState<"search" | "pending" | "sent">(
    "search",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Get current user to filter out from search
  const { data: currentUser } = useUserProfile();

  // Queries
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(
    debouncedQuery,
    10,
  );
  const { data: pendingRequests, isLoading: isPendingLoading } =
    usePendingFriendRequests();
  const { data: sentRequests, isLoading: isSentLoading } =
    useSentFriendRequests();
  const { data: friendsList } = useFriendsList();

  // Mutations
  const sendRequestMutation = useSendFriendRequest();
  const acceptRequestMutation = useAcceptFriendRequest();
  const rejectRequestMutation = useRejectFriendRequest();
  const cancelRequestMutation = useCancelFriendRequest();

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
  };

  const handleSendRequest = (userId: string) => {
    sendRequestMutation.mutate({ receiverId: userId });
  };

  // Check if user is already a friend
  const isAlreadyFriend = (userId: string) => {
    return friendsList?.some((friend) => friend.id === userId) || false;
  };

  // Check if there's already a pending request (sent or received)
  const hasPendingRequest = (userId: string) => {
    const hasSentRequest = sentRequests?.some(
      (req) => req.receiver?.id === userId,
    );
    const hasReceivedRequest = pendingRequests?.some(
      (req) => req.sender?.id === userId,
    );
    return hasSentRequest || hasReceivedRequest;
  };

  // Get the status of a user relationship
  const getUserStatus = (userId: string) => {
    if (isAlreadyFriend(userId)) return "friend";
    if (hasPendingRequest(userId)) return "pending";
    return "none";
  };

  const handleAcceptRequest = (requestId: string) => {
    acceptRequestMutation.mutate(requestId);
  };

  const handleRejectRequest = (requestId: string) => {
    rejectRequestMutation.mutate(requestId);
  };

  const handleCancelRequest = (requestId: string) => {
    cancelRequestMutation.mutate(requestId);
  };

  return (
    <div className="flex flex-col h-full">
      <PathHeader PageName="Friends Requests" />

      {/* Tabs */}
      <div className="flex border-b border-border bg-panel">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${
            activeTab === "search"
              ? "text-primaryColor border-b-2 border-primaryColor"
              : "text-secondary hover:text-primary"
          }`}
        >
          Search Users
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 px-2 py-3 text-xs font-medium transition-colors relative ${
            activeTab === "pending"
              ? "text-primaryColor border-b-2 border-primaryColor"
              : "text-secondary hover:text-primary"
          }`}
        >
          Received
          {pendingRequests && pendingRequests.length > 0 && (
            <span className="absolute top-1 right-1 bg-primaryColor text-white text-[11px] rounded-full w-4 h-4 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`flex-1 px-2 py-3 text-xs font-medium transition-colors relative ${
            activeTab === "sent"
              ? "text-primaryColor border-b-2 border-primaryColor"
              : "text-secondary hover:text-primary"
          }`}
        >
          Sent
          {sentRequests && sentRequests.length > 0 && (
            <span className="absolute top-1 right-1 bg-primaryColor text-white text-[11px] rounded-full w-4 h-4 flex items-center justify-center">
              {sentRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="py-4 space-y-4">
            {/* Search Input */}
            <div className="relative px-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 text-xs  border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor text-primary placeholder-secondary"
              />
            </div>

            {/* Search Results */}
            {isSearching ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor"></div>
              </div>
            ) : debouncedQuery && searchResults && searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults
                  .filter((user) => user.id !== currentUser?.id) // Filter out current user
                  .map((user) => {
                    const status = getUserStatus(user.id);

                    return (
                      <UserListItem
                        key={user.id}
                        user={user}
                        containerClassName="hover:bg-border transition-colors"
                        titleClassName="text-[13px] font-normal"
                        subtitleClassName="text-[10px]"
                        trailing={
                          status === "friend" ? (
                            <div className="flex items-center gap-2 px-2 py-2 bg-success-100 text-success-700 rounded-lg text-xs font-medium">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Friends
                            </div>
                          ) : status === "pending" ? (
                            <div className="flex items-center gap-2 px-2 py-2 bg-warning-100 text-warning-700 rounded-lg text-xs font-medium">
                              <svg
                                className="w-3 h-3 animate-pulse"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Pending
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user.id)}
                              disabled={sendRequestMutation.isPending}
                              className="px-2 py-2 bg-primaryColor text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-xs font-medium"
                            >
                              {sendRequestMutation.isPending
                                ? "Sending..."
                                : "Add Friend"}
                            </button>
                          )
                        }
                      />
                    );
                  })}
              </div>
            ) : debouncedQuery ? (
              <div className="text-center py-8 text-secondary">
                <svg
                  className="w-10 h-10 mx-auto mb-3 text-secondary opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-xs">No users found</p>
              </div>
            ) : (
              <div className="text-center py-8 text-secondary">
                <svg
                  className="w-10 h-10 mx-auto mb-3 text-secondary opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-xs">Search for users to send friend requests</p>
              </div>
            )}
          </div>
        )}

        {/* Pending Requests Tab */}
        {activeTab === "pending" && (
          <div className="py-4 space-y-2">
            {isPendingLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor"></div>
              </div>
            ) : pendingRequests && pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <UserListItem
                  key={request.id}
                  user={request.sender || { id: request.id }}
                  titleClassName="text-[13px] font-normal"
                  subtitleClassName="text-[10px]"
                  trailing={
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={acceptRequestMutation.isPending}
                        className="p-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={rejectRequestMutation.isPending}
                        className="p-1 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        title="Reject"
                      >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  }
                />
              ))
            ) : (
              <div className="text-center py-8 text-secondary">
                <svg
                  className="w-10 h-10 mx-auto mb-3 text-secondary opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-xs">No pending friend requests</p>
              </div>
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === "sent" && (
          <div className="py-4 space-y-2">
            {isSentLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor"></div>
              </div>
            ) : sentRequests && sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <UserListItem
                  key={request.id}
                  user={request.receiver || { id: request.id }}
                  titleClassName="text-[13px] font-normal"
                  subtitleClassName="text-[10px]"
                  footer={
                    <p className="text-xs text-warning-500 mt-1">Pending</p>
                  }
                  trailing={
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      disabled={cancelRequestMutation.isPending}
                      className="px-3 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors disabled:opacity-50 text-xs font-medium"
                    >
                      {cancelRequestMutation.isPending
                        ? "Canceling..."
                        : "Cancel"}
                    </button>
                  }
                />
              ))
            ) : (
              <div className="text-center py-8 text-secondary">
                <svg
                  className="w-10 h-10 mx-auto mb-3 text-secondary opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <p className="text-xs">No sent friend requests</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsRequests;
