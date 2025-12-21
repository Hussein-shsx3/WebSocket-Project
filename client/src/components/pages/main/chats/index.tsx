"use client";

import { useState } from "react";
import { Search, Plus, Pin } from "lucide-react";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  pinned: boolean;
}

const Chats = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const favourites: Chat[] = [
    {
      id: "1",
      name: "Bella Cote",
      avatar: "A",
      lastMessage: "Wow that's great",
      time: "10:14 am",
      unread: 18,
      online: true,
      pinned: true,
    },
    {
      id: "2",
      name: "Steven Jury",
      avatar: "A",
      lastMessage: "Thank you!",
      time: "Yesterday",
      unread: 0,
      online: false,
      pinned: false,
    },
    {
      id: "3",
      name: "James Pinard",
      avatar: "JP",
      lastMessage: "See you soon",
      time: "Yesterday",
      unread: 0,
      online: true,
      pinned: false,
    },
    {
      id: "4",
      name: "Alissa Richards",
      avatar: "AR",
      lastMessage: "Great work!",
      time: "Yesterday",
      unread: 0,
      online: false,
      pinned: false,
    },
  ];

  const directMessages: Chat[] = [
    {
      id: "5",
      name: "Nicholas Staten",
      avatar: "NS",
      lastMessage: "Perfect!",
      time: "02:45 pm",
      unread: 2,
      online: true,
      pinned: false,
    },
    {
      id: "6",
      name: "Kathryn Swarey",
      avatar: "KS",
      lastMessage: "See you tomorrow",
      time: "01:30 pm",
      unread: 0,
      online: false,
      pinned: false,
    },
    {
      id: "7",
      name: "Robert Ledonne",
      avatar: "RL",
      lastMessage: "Thanks!",
      time: "12:30 pm",
      unread: 0,
      online: true,
      pinned: false,
    },
    {
      id: "8",
      name: "Steven Jury",
      avatar: "SJ",
      lastMessage: "Sounds good",
      time: "11:45 am",
      unread: 0,
      online: false,
      pinned: false,
    },
    {
      id: "9",
      name: "Jessica Lewis",
      avatar: "JL",
      lastMessage: "Let me know",
      time: "10:30 am",
      unread: 0,
      online: true,
      pinned: false,
    },
    {
      id: "10",
      name: "John Foss",
      avatar: "JF",
      lastMessage: "Will do",
      time: "Yesterday",
      unread: 0,
      online: false,
      pinned: false,
    },
    {
      id: "11",
      name: "Gloria Underhill",
      avatar: "GU",
      lastMessage: "Perfect timing",
      time: "Yesterday",
      unread: 0,
      online: false,
      pinned: false,
    },
  ];

  const channels = [
    { id: "ch1", name: "Landing Design", unread: 12 },
    { id: "ch2", name: "Design Phase 2", unread: 0 },
    { id: "ch3", name: "Brand Suggestion", unread: 85 },
    { id: "ch4", name: "Reporting", unread: 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-panel">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-primary">Chats</h1>
          <button className="w-7 h-7 rounded-md bg-primaryColor/10 flex items-center justify-center hover:bg-primaryColor/20 transition-colors text-primaryColor">
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-search-bg border-0 rounded-md text-xs text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primaryColor/30"
          />
        </div>
      </div>

      {/* Chat Lists */}
      <div className="flex-1 overflow-y-auto bg-panel">
        {/* Favourites */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
              Favourites
            </h3>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-hover transition-colors">
              <Plus className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
            </button>
          </div>
          <div className="space-y-1">
            {favourites.map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        </div>

        {/* Direct Messages */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
              Direct Messages
            </h3>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-hover transition-colors">
              <Plus className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
            </button>
          </div>
          <div className="space-y-1">
            {directMessages.map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
              Channels
            </h3>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-hover transition-colors">
              <Plus className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
            </button>
          </div>
          <div className="space-y-1">
            {channels.map((channel) => (
              <ChannelItem key={channel.id} channel={channel} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

// Chat Item Component
function ChatItem({ chat }: { chat: Chat }) {
  return (
    <button className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-chat-hover transition-colors group">
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-primaryColor/20 flex items-center justify-center text-primaryColor text-xs font-semibold">
          {chat.avatar}
        </div>
        {chat.online && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-panel" />
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-sm font-medium text-primary truncate">
            {chat.name}
          </h4>
          <span className="text-[10px] text-secondary flex-shrink-0 ml-2">
            {chat.time}
          </span>
        </div>
        <p className="text-xs text-secondary truncate">{chat.lastMessage}</p>
      </div>

      {/* Unread Badge & Pin */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {chat.unread > 0 && (
          <div className="min-w-[18px] h-[18px] px-1.5 bg-primaryColor rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white font-semibold leading-none">
              {chat.unread}
            </span>
          </div>
        )}
        {chat.pinned && (
          <Pin className="w-3 h-3 text-secondary" strokeWidth={2} />
        )}
      </div>
    </button>
  );
}

// Channel Item Component
function ChannelItem({
  channel,
}: {
  channel: { id: string; name: string; unread: number };
}) {
  return (
    <button className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-chat-hover transition-colors group">
      {/* Hash Icon */}
      <div className="w-9 h-9 flex items-center justify-center text-secondary text-base">
        #
      </div>

      {/* Channel Info */}
      <div className="flex-1 min-w-0 text-left">
        <h4 className="text-sm font-medium text-primary truncate">
          {channel.name}
        </h4>
      </div>

      {/* Unread Badge */}
      {channel.unread > 0 && (
        <div className="min-w-[18px] h-[18px] px-1.5 bg-primaryColor/20 rounded flex items-center justify-center">
          <span className="text-[10px] text-primary font-semibold leading-none">
            {channel.unread}
          </span>
        </div>
      )}
    </button>
  );
}

export default Chats;
