// client/src/utils/message.utils.ts

import { format, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns";
import type { Message } from "@/services/messages.service";

/**
 * Grouped messages by date
 */
export interface MessageGroup {
  date: string; // ISO date string
  dateLabel: string; // Human-readable label
  messages: Message[];
}

/**
 * Format date for message grouping
 * - Today → "Today"
 * - Yesterday → "Yesterday"
 * - This week → "Monday", "Tuesday", etc.
 * - This year → "January 15"
 * - Other years → "January 15, 2023"
 */
export const formatMessageDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isToday(dateObj)) {
    return "Today";
  }

  if (isYesterday(dateObj)) {
    return "Yesterday";
  }

  if (isThisWeek(dateObj, { weekStartsOn: 0 })) {
    return format(dateObj, "EEEE"); // Monday, Tuesday, etc.
  }

  if (isThisYear(dateObj)) {
    return format(dateObj, "MMMM d"); // January 15
  }

  return format(dateObj, "MMMM d, yyyy"); // January 15, 2023
};

/**
 * Group messages by date
 * Returns array of date groups with their messages
 */
export const groupMessagesByDate = (messages: Message[]): MessageGroup[] => {
  if (!messages || messages.length === 0) return [];

  // Sort messages oldest to newest
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const groups: Map<string, Message[]> = new Map();

  sortedMessages.forEach((message) => {
    // Get date without time (YYYY-MM-DD)
    const date = format(new Date(message.createdAt), "yyyy-MM-dd");

    if (!groups.has(date)) {
      groups.set(date, []);
    }

    groups.get(date)!.push(message);
  });

  // Convert map to array of groups
  return Array.from(groups.entries()).map(([date, messages]) => ({
    date,
    dateLabel: formatMessageDate(new Date(date)),
    messages,
  }));
};

/**
 * Format message time (HH:MM)
 */
export const formatMessageTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "HH:mm");
};

/**
 * Check if message is from current user
 */
export const isOwnMessage = (
  message: Message,
  currentUserId: string
): boolean => {
  return message.sender.id === currentUserId;
};
