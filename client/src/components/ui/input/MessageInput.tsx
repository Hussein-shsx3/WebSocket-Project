// client/src/components/ui/input/MessageInput.tsx

"use client";

import { useState, useRef } from "react";
import { Send, Smile, Paperclip, Loader2, X } from "lucide-react";
import { socketEmitters } from "@/socket/emitters";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/chat.types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import EmojiPicker from "emoji-picker-react";
import { useEmojiPicker } from "@/hooks/useEmojiPicker";
import { useFileUpload } from "@/hooks/useFileUpload";

interface MessageInputProps {
  conversationId: string;
  onSendMessage?: (content: string) => void;
  disabled?: boolean;
}

/**
 * Message Input Component
 * Handles message composition and sending via Socket.IO
 *
 * Features:
 * - Single-line input field
 * - Typing indicators (TODO)
 * - Send on Enter
 * - Socket.IO integration for real-time sending
 */
export const MessageInput = ({
  conversationId,
  onSendMessage,
  disabled = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const { showEmojiPicker, toggleEmojiPicker, closeEmojiPicker, insertEmoji } = useEmojiPicker();
  const { mediaUrls, isUploading, uploadFile, clearMedia } = useFileUpload();

  // Send typing indicator
  const handleTyping = () => {
    // Emit typing start
    socketEmitters.typingStart(conversationId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to emit typing stop after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socketEmitters.typingStop(conversationId);
    }, 3000);
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setMessage((prev) => insertEmoji(prev, emojiData.emoji));
    closeEmojiPicker();
    inputRef.current?.focus();
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
    e.target.value = ""; // Reset input
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };

  // Send message
  const handleSend = async () => {
    const trimmedMessage = message.trim();

    if ((!trimmedMessage && mediaUrls.length === 0) || isSending || disabled) return;

    setIsSending(true);

    try {
      // Emit message via Socket.IO
      const success = socketEmitters.sendMessage({
        conversationId,
        content: trimmedMessage,
        type: "TEXT",
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });

      if (success) {
        // Optimistically update the cache
        if (currentUser) {
          const optimisticMessage: Message = {
            id: `temp-${Date.now()}`, // Temporary ID
            conversationId,
            senderId: currentUser.userId,
            content: trimmedMessage,
            type: "TEXT",
            mediaUrls,
            status: "SENT",
            isEdited: false,
            editedAt: null,
            editedContent: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: {
              id: currentUser.userId,
              name: null, // Will be updated by socket
              avatar: null,
            },
            readBy: [],
            reactions: [],
          };

          // Update all messages queries for this conversation
          queryClient.setQueriesData(
            { predicate: (query) => query.queryKey[0] === "messages" && query.queryKey[1] === conversationId },
            (oldData: unknown) => {
              if (!oldData) return oldData;

              // If it's an array of messages
              if (Array.isArray(oldData)) {
                return [optimisticMessage, ...oldData];
              }

              // If it's an object with a `.messages` array
              const objData = oldData as Record<string, unknown>;
              if (objData.messages && Array.isArray(objData.messages)) {
                return { ...objData, messages: [optimisticMessage, ...(objData.messages as Message[])] };
              }

              // If it's the infinite-query shape
              if (objData.pages && Array.isArray(objData.pages)) {
                const newPages = [...(objData.pages as Message[][])];
                if (newPages[0]) newPages[0] = [optimisticMessage, ...newPages[0]];
                return { ...objData, pages: newPages };
              }

              return oldData;
            }
          );
        }

        // Clear input
        setMessage("");
        clearMedia();

        // Stop typing indicator
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        socketEmitters.typingStop(conversationId);

        // Optional callback
        onSendMessage?.(trimmedMessage);
      } else {
        toast.error("Failed to send message. Please check your connection.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Send on Enter
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-panel">
      {/* File Preview - Show above input when files are attached */}
      {mediaUrls.length > 0 && (
        <div className="mb-3 p-3 bg-muted rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Attachment</span>
            <button
              onClick={clearMedia}
              className="p-1 text-secondary hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primaryColor/10 rounded-lg flex items-center justify-center">
                <Paperclip className="w-5 h-5 text-primaryColor" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary truncate">File attached</p>
              <p className="text-xs text-secondary">Ready to send</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Loading State */}
      {isUploading && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-700 dark:text-blue-300">Uploading file...</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Please wait</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Emoji Picker Button */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={toggleEmojiPicker}
            className="p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add emoji"
            disabled={disabled || isSending}
          >
            <Smile className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 left-0 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || isSending || isUploading}
            className="w-full px-4 py-3 bg-search-bg border border-border rounded-lg text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primaryColor/30 focus:border-primaryColor disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />

          {/* Character count */}
          {message.length > 0 && (
            <div className="absolute -top-6 right-0 text-xs text-secondary">
              {message.length}
            </div>
          )}
        </div>

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending || isUploading}
          className="p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Attach file"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!message.trim() && mediaUrls.length === 0) || isSending || isUploading || disabled}
          className="p-3 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Send message"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
