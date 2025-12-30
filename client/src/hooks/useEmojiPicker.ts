"use client";

import { useState } from "react";

/**
 * Hook for managing emoji picker functionality
 */
export const useEmojiPicker = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const closeEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  const insertEmoji = (currentMessage: string, emoji: string): string => {
    return currentMessage + emoji;
  };

  return {
    showEmojiPicker,
    toggleEmojiPicker,
    closeEmojiPicker,
    insertEmoji,
  };
};