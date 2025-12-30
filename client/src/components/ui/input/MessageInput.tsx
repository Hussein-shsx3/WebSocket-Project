// client/src/components/ui/input/MessageInput.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
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
 * - Auto-resize textarea
 * - Typing indicators (TODO)
 * - Send on Enter (Shift+Enter for new line)
 * - Socket.IO integration for real-time sending
 */
export const MessageInput = ({
  conversationId,
  onSendMessage,
  disabled = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const { showEmojiPicker, toggleEmojiPicker, closeEmojiPicker, insertEmoji } = useEmojiPicker();
  const { mediaUrls, isUploading, uploadFile, clearMedia } = useFileUpload();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

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
    textareaRef.current?.focus();
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
    e.target.value = ""; // Reset input
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-panel">
      <div className="flex items-center gap-1">
        {/* Emoji Picker Button */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleEmojiPicker}
            className="p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-muted"
            title="Add emoji"
            disabled={disabled}
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
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || isSending}
            rows={1}
            className="w-full px-4 py-2 pr-10 bg-search-bg border border-border rounded-lg text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primaryColor/30 resize-none max-h-[130px] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* File preview */}
        {mediaUrls.length > 0 && (
          <div className="mt-2 p-2 bg-muted rounded-lg flex items-center gap-2">
            <span className="text-sm text-secondary">File attached</span>
            <button
              onClick={clearMedia}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Character count (optional) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-muted disabled:opacity-50"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          title="Attach a file"
          placeholder="Attach a file"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() && mediaUrls.length === 0 || isSending || isUploading || disabled}
          className="p-2 bg-primaryColor text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Character count (optional) */}
      {message.length > 0 && (
        <div className="mt-1 text-xs text-secondary text-right">
          {message.length} characters
        </div>
      )}
    </div>
  );
};
