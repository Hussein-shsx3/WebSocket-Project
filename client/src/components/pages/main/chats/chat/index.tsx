"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useConversationOtherUser } from "@/hooks/useConversations";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCall } from "@/providers/CallProvider";
import { Message } from "@/services/messages.service";
import { ChatHeader } from "./ChatHeader";
import {
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  Image as ImageIcon,
  File,
  X,
  Check,
  CheckCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const getInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || "?";
};

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateDivider = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return date.toLocaleDateString([], { weekday: "long" });
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

// =====================================================
// MESSAGE BUBBLE COMPONENT
// =====================================================

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
  isFirstInGroup,
  isLastInGroup,
  onEdit,
  onDelete,
}: MessageBubbleProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [isEditing, editText.length]);

  // Determine border radius based on position in group
  const getBorderRadius = () => {
    if (isOwn) {
      if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-br-lg";
      if (isFirstInGroup) return "rounded-2xl rounded-br-md";
      if (isLastInGroup) return "rounded-2xl rounded-tr-md rounded-br-lg";
      return "rounded-2xl rounded-r-md";
    } else {
      if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-bl-lg";
      if (isFirstInGroup) return "rounded-2xl rounded-bl-md";
      if (isLastInGroup) return "rounded-2xl rounded-tl-md rounded-bl-lg";
      return "rounded-2xl rounded-l-md";
    }
  };

  // Check if message contains only emojis
  const isOnlyEmoji = (text: string) => {
    const emojiRegex = /^[\p{Emoji}\s]+$/u;
    return emojiRegex.test(text) && text.trim().length <= 8;
  };

  const onlyEmoji = isOnlyEmoji(message.content);

  // Handle edit submit
  const handleEditSubmit = () => {
    if (editText.trim() && editText !== message.content) {
      onEdit?.(message.id, editText.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  // Handle delete
  const handleDelete = () => {
    onDelete?.(message.id);
    setShowMenu(false);
  };

  // Handle copy
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  // Handle key down in edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  // Don't show menu for deleted messages
  const canShowMenu = !message.isDeleted;

  return (
    <div
      className={`group flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"} ${
        isLastInGroup ? "mb-3" : "mb-0.5"
      }`}
    >
      {/* Avatar - only show for other users */}
      {!isOwn && (
        <div className="flex-shrink-0 w-8 self-end">
          {showAvatar && isLastInGroup ? (
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-surface">
              {message.sender.avatar ? (
                <Image
                  src={message.sender.avatar}
                  alt={message.sender.name || "User"}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primaryColor to-primaryColor/70 flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(message.sender.name)}
                </div>
              )}
            </div>
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`relative max-w-[65%] flex flex-col ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* Message Actions Menu - appears on hover */}
        {canShowMenu && (
          <div
            ref={menuRef}
            className={`absolute top-0 ${
              isOwn
                ? "left-0 -translate-x-full pr-2"
                : "right-0 translate-x-full pl-2"
            } opacity-0 group-hover:opacity-100 transition-opacity z-10`}
          >
            {/* Quick action button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg bg-surface border border-border shadow-sm hover:bg-hover transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-secondary" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className={`absolute top-full mt-1 ${
                  isOwn ? "right-0" : "left-0"
                } bg-panel border border-border rounded-xl shadow-xl overflow-hidden min-w-[140px] z-20`}
              >
                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-hover transition-colors"
                >
                  <Copy className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-primary">Copy</span>
                </button>

                {/* Edit - only for own messages */}
                {isOwn && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-hover transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-primary">Edit</span>
                  </button>
                )}

                {/* Delete - only for own messages */}
                {isOwn && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message Bubble */}
        {isEditing ? (
          // Edit mode
          <div className="w-full min-w-[200px]">
            <div
              className={`px-3.5 py-2 ${getBorderRadius()} bg-surface border-2 border-primaryColor shadow-sm`}
            >
              <textarea
                ref={editInputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="w-full bg-transparent text-sm text-primary resize-none focus:outline-none"
                rows={Math.min(editText.split("\n").length, 5)}
              />
            </div>
            <div className="flex items-center gap-2 mt-1.5 px-1">
              <span className="text-[10px] text-secondary">
                Esc to cancel • Enter to save
              </span>
              <div className="flex-1" />
              <button
                onClick={handleEditCancel}
                className="text-xs text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="text-xs text-primaryColor hover:text-primaryColor/80 font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : onlyEmoji ? (
          // Large emoji display
          <div className="text-4xl leading-tight py-1">{message.content}</div>
        ) : (
          <div
            className={`px-3.5 py-2 ${getBorderRadius()} ${
              isOwn
                ? "bg-[#385541] text-white"
                : "bg-panel text-primary border border-border"
            } shadow-sm`}
          >
            {/* Media content */}
            {message.mediaUrls && message.mediaUrls.length > 0 && (
              <div className="mb-2 rounded-lg overflow-hidden">
                {message.type === "IMAGE" ? (
                  <Image
                    src={message.mediaUrls[0]}
                    alt="Shared image"
                    width={250}
                    height={200}
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                    <File className="w-5 h-5" />
                    <span className="text-xs truncate">
                      {message.mediaUrls[0].split("/").pop()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Text content */}
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
              {message.isDeleted ? (
                <span className="italic opacity-60">Message deleted</span>
              ) : (
                message.content
              )}
            </p>
          </div>
        )}

        {/* Time and status - only show on last message in group */}
        {isLastInGroup && !isEditing && (
          <div
            className={`flex items-center gap-1 mt-1 px-1 ${
              isOwn ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <span className="text-[10px] text-secondary/70">
              {formatMessageTime(message.createdAt)}
              {message.isEdited && " · edited"}
            </span>
            {isOwn && (
              <span className="text-primaryColor">
                {message.status === "READ" ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : message.status === "DELIVERED" ? (
                  <CheckCheck className="w-3.5 h-3.5 opacity-50" />
                ) : (
                  <Check className="w-3.5 h-3.5 opacity-50" />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// DATE DIVIDER COMPONENT
// =====================================================

const DateDivider = ({ date }: { date: string }) => (
  <div className="flex items-center justify-center py-4">
    <span className="px-3 py-1 text-[11px] text-secondary bg-surface/60 rounded-full font-medium">
      {formatDateDivider(date)}
    </span>
  </div>
);

// =====================================================
// TYPING INDICATOR COMPONENT
// =====================================================

const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-2">
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" />
    </div>
    <span className="text-xs text-secondary">typing...</span>
  </div>
);

// =====================================================
// FILE PREVIEW COMPONENT
// =====================================================

interface FilePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

const FilePreview = ({ files, onRemove }: FilePreviewProps) => {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-2 px-4 py-2 bg-surface/50 border-t border-border overflow-x-auto">
      {files.map((file, index) => (
        <div key={index} className="relative flex-shrink-0 group">
          {file.type.startsWith("image/") ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-border">
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-surface border border-border flex flex-col items-center justify-center p-2">
              <File className="w-5 h-5 text-secondary mb-1" />
              <span className="text-[9px] text-secondary truncate w-full text-center">
                {file.name.slice(0, 8)}...
              </span>
            </div>
          )}
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

// =====================================================
// MAIN CHAT COMPONENT
// =====================================================

const Chat = () => {
  const params = useParams();
  const conversationId = params?.conversationId as string;

  // State
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: otherUser, isLoading: isUserLoading } =
    useConversationOtherUser(conversationId);
  const { data: currentUser } = useUserProfile();

  // Call functionality
  const { startCall } = useCall();

  // Socket for real-time messages
  const {
    messages,
    isLoading: isMessagesLoading,
    sendMessage: socketSendMessage,
    editMessage: socketEditMessage,
    deleteMessage: socketDeleteMessage,
    typingUsers,
    startTyping,
    stopTyping,
  } = useChatSocket({
    conversationId,
    enabled: !!conversationId,
  });

  // Handle voice call
  const handleVoiceCall = useCallback(() => {
    if (conversationId && otherUser) {
      const callUser = {
        id: otherUser.id,
        name: otherUser.name || "Unknown",
        avatar: otherUser.avatar,
      };
      startCall(conversationId, otherUser.id, callUser, "AUDIO");
    }
  }, [conversationId, otherUser, startCall]);

  // Handle video call
  const handleVideoCall = useCallback(() => {
    if (conversationId && otherUser) {
      const callUser = {
        id: otherUser.id,
        name: otherUser.name || "Unknown",
        avatar: otherUser.avatar,
      };
      startCall(conversationId, otherUser.id, callUser, "VIDEO");
    }
  }, [conversationId, otherUser, startCall]);

  // Handle edit message
  const handleEditMessage = useCallback(
    (messageId: string, content: string) => {
      socketEditMessage(messageId, content);
    },
    [socketEditMessage],
  );

  // Handle delete message
  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      socketDeleteMessage(messageId);
    },
    [socketDeleteMessage],
  );

  // Group messages by date and sender
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();
      const existingGroup = groups.find((g) => g.date === messageDate);

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: messageDate, messages: [message] });
      }
    });

    return groups;
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAttachMenu(false);
    };

    if (showAttachMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showAttachMenu]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    startTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [startTyping, stopTyping]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if ((!messageText.trim() && selectedFiles.length === 0) || !conversationId)
      return;

    // TODO: Handle file upload here
    // For now, just send text
    if (messageText.trim()) {
      socketSendMessage(messageText.trim());
    }

    // Clear state
    stopTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setMessageText("");
    setSelectedFiles([]);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, [
    messageText,
    selectedFiles,
    conversationId,
    socketSendMessage,
    stopTyping,
  ]);

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    handleTyping();
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5)); // Max 5 files
    e.target.value = ""; // Reset input
  };

  // Remove file from selection
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        120,
      )}px`;
    }
  }, [messageText]);

  // Empty state
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-main text-secondary">
        <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
          <MessageSquare className="w-10 h-10 opacity-40" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-1">
          Select a conversation
        </h3>
        <p className="text-sm text-secondary">
          Choose a chat from the sidebar to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-main overflow-hidden">
      {/* ==================== HEADER ==================== */}
      <ChatHeader
        user={otherUser}
        conversationId={conversationId}
        isLoading={isUserLoading}
        isTyping={typingUsers.length > 0}
        onCallClick={handleVoiceCall}
        onVideoClick={handleVideoCall}
      />

      {/* ==================== MESSAGES ==================== */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 pb-20 md:pb-2 scroll-smooth"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      >
        {isMessagesLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 border-2 border-primaryColor border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-secondary mt-4">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8 text-secondary/50" />
            </div>
            <p className="text-sm font-medium text-primary">No messages yet</p>
            <p className="text-xs text-secondary mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <div className="py-2">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <DateDivider date={group.messages[0].createdAt} />
                <div>
                  {group.messages.map((message, index) => {
                    const isOwn = message.senderId === currentUser?.id;
                    const prevMessage = group.messages[index - 1];
                    const nextMessage = group.messages[index + 1];

                    const isFirstInGroup =
                      !prevMessage || prevMessage.senderId !== message.senderId;
                    const isLastInGroup =
                      !nextMessage || nextMessage.senderId !== message.senderId;

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showAvatar={!isOwn}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={isLastInGroup}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ==================== FILE PREVIEW ==================== */}
      <FilePreview files={selectedFiles} onRemove={handleRemoveFile} />

      {/* ==================== INPUT AREA ==================== */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto px-4 py-3 bg-panel border-t border-border flex-shrink-0 z-40">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-full left-4 mb-2 z-50 shadow-xl rounded-xl overflow-hidden"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              width={320}
              height={400}
              searchPlaceholder="Search emojis..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        {/* Attachment Menu */}
        {showAttachMenu && (
          <div className="absolute bottom-full left-4 mb-2 z-50 bg-panel border border-border rounded-xl shadow-xl overflow-hidden">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-hover transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Photo</p>
                <p className="text-xs text-secondary">Share images</p>
              </div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-hover transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                <File className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Document</p>
                <p className="text-xs text-secondary">Share files</p>
              </div>
            </button>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Input Row */}
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
              showAttachMenu
                ? "bg-primaryColor/10 text-primaryColor"
                : "hover:bg-hover text-secondary hover:text-primary"
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Input Container */}
          <div className="flex-1 flex items-end bg-surface border border-border rounded-2xl transition-all focus-within:border-primaryColor/50 focus-within:ring-2 focus-within:ring-primaryColor/20">
            {/* Emoji Button */}
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
                showEmojiPicker
                  ? "text-primaryColor"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 py-2.5 pr-3 text-sm bg-transparent text-primary placeholder-secondary resize-none focus:outline-none max-h-[120px]"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() && selectedFiles.length === 0}
            className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${
              messageText.trim() || selectedFiles.length > 0
                ? "bg-primaryColor text-white hover:bg-primaryColor/90 hover:scale-105 active:scale-95 shadow-lg shadow-primaryColor/25"
                : "bg-surface text-secondary cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
