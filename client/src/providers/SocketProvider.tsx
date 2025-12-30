"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { socketClient } from "@/socket/client";
import { registerSocketEvents } from "@/socket/events";
import { socketEmitters } from "@/socket/emitters";
import { useSocketHandlers } from "@/socket/react-query-handlers";

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const cleanupRef = useRef<(() => void) | null>(null);
  // Initialize token from cookies
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return Cookies.get("accessToken") || null;
    }
    return null;
  });

  // ✅ Get handlers (they're already stable because useQueryClient is stable)
  const socketHandlers = useSocketHandlers();

  // Monitor token changes in cookies
  useEffect(() => {
    // Listen for storage events (in case token is updated in another tab)
    const handleStorageChange = () => {
      const newToken = Cookies.get("accessToken");
      setToken(newToken || null);
    };

    // Check for token changes periodically (cookies can be updated by server/axios interceptor)
    const interval = setInterval(() => {
      const currentToken = Cookies.get("accessToken");
      setToken((prevToken) => {
        if (currentToken !== prevToken) {
          return currentToken || null;
        }
        return prevToken;
      });
    }, 1000); // Check every second

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Don't connect if no token
    if (!token) {
      // no token - skipping socket connection (log removed)
      return;
    }

    // Create socket connection with JWT token
    const socket = socketClient.create(token);

    // Setup connection event handler
    socket.on("connect", () => {
      // socket connected (log removed)

      // Emit user:online when connected
      socketEmitters.userOnline();
    });

    // Register all event listeners with handlers
    cleanupRef.current = registerSocketEvents(socket, socketHandlers);

    // Handle page visibility (when user switches tabs/windows)
    const handleVisibilityChange = () => {
        if (document.hidden) {
          // Page hidden (log removed)
        } else {
          // Page visible (log removed)
          if (socket.connected) {
            socketEmitters.userOnline();
          }
        }
    };

    // Handle beforeunload (when user closes tab/window)
    const handleBeforeUnload = () => {
      // Socket will automatically disconnect and emit offline status (log removed)
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on unmount or token change
    return () => {
      // cleaning up socket connection (log removed)

      // Remove event listeners
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Remove all listeners
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Destroy socket (this will trigger disconnect event on server)
      socketClient.destroy();
    };
  }, [token, socketHandlers]);

  return <>{children}</>;
};
