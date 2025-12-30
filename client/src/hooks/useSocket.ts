"use client";

import { useSyncExternalStore } from "react";
import { socketClient } from "@/socket/client";
import type { SocketState } from "@/types/socket.types";

/**
 * Hook to subscribe to socket connection state
 * Uses React 18's useSyncExternalStore for optimal performance
 */
export const useSocketState = (): SocketState => {
  return useSyncExternalStore(
    (callback) => socketClient.subscribe(callback),
    () => socketClient.getState(),
    () => socketClient.getState()
  );
};

/**
 * Hook to get socket connection status
 */
export const useSocketStatus = () => {
  const state = useSocketState();

  return {
    status: state.status,
    isConnected: state.status === "connected",
    isConnecting: state.status === "connecting",
    isReconnecting: state.status === "reconnecting",
    isDisconnected: state.status === "disconnected",
    hasError: state.status === "error",
    error: state.error,
    reconnectAttempts: state.reconnectAttempts,
    lastConnected: state.lastConnected,
  };
};
