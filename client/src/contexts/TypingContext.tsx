// client/src/contexts/TypingContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocketHandlers } from '@/socket/react-query-handlers';

interface TypingState {
  [conversationId: string]: string[]; // Array of user IDs typing in each conversation
}

interface TypingContextType {
  typingState: TypingState;
  isUserTyping: (conversationId: string, userId: string) => boolean;
  getTypingUsers: (conversationId: string) => string[];
}

const TypingContext = createContext<TypingContextType | undefined>(undefined);

export const useTypingContext = () => {
  const context = useContext(TypingContext);
  if (!context) {
    throw new Error('useTypingContext must be used within a TypingProvider');
  }
  return context;
};

interface TypingProviderProps {
  children: ReactNode;
}

export const TypingProvider = ({ children }: TypingProviderProps) => {
  const [typingState, setTypingState] = useState<TypingState>({});

  // Get socket handlers to listen for typing events
  const socketHandlers = useSocketHandlers();

  useEffect(() => {
    // Create a custom typing handler that updates both global state and React Query
    const customOnTyping = (data: any) => {
      // Update global typing state
      setTypingState(prev => {
        const currentTyping = prev[data.conversationId] || [];

        if (data.isTyping) {
          // Add user to typing list if not already there
          if (!currentTyping.includes(data.userId)) {
            return {
              ...prev,
              [data.conversationId]: [...currentTyping, data.userId]
            };
          }
        } else {
          // Remove user from typing list
          const filtered = currentTyping.filter(id => id !== data.userId);
          if (filtered.length === 0) {
            const { [data.conversationId]: _, ...rest } = prev;
            return rest;
          }
          return {
            ...prev,
            [data.conversationId]: filtered
          };
        }

        return prev;
      });

      // Update React Query cache
      const { queryClient } = require('@tanstack/react-query');
      const queryClientInstance = queryClient;

      if (queryClientInstance) {
        queryClientInstance.setQueryData(
          ["typing", data.conversationId],
          (oldData: string[] | undefined) => {
            const currentTyping = oldData || [];

            if (data.isTyping) {
              // Add user to typing list if not already there
              if (!currentTyping.includes(data.userId)) {
                return [...currentTyping, data.userId];
              }
            } else {
              // Remove user from typing list
              return currentTyping.filter(id => id !== data.userId);
            }

            return currentTyping;
          }
        );
      }
    };

    // Override the socket handler
    socketHandlers.onTyping = customOnTyping;
  }, [socketHandlers]);

  const isUserTyping = (conversationId: string, userId: string) => {
    return (typingState[conversationId] || []).includes(userId);
  };

  const getTypingUsers = (conversationId: string) => {
    return typingState[conversationId] || [];
  };

  const value = {
    typingState,
    isUserTyping,
    getTypingUsers,
  };

  return (
    <TypingContext.Provider value={value}>
      {children}
    </TypingContext.Provider>
  );
};