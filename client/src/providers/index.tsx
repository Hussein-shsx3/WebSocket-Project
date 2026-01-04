"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { SocketProvider } from "./SocketProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { CallProvider } from "@/contexts/CallContext";
import { CallUI } from "@/components/ui/call/CallUI";
import { Toaster } from "react-hot-toast"; // Or your toast library

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Main Providers wrapper component
 * Wraps all global providers: Theme, React Query, Socket.IO, Calls
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <SocketProvider>
          <CallProvider>
            {children}
            {/* Global Call UI - renders when there's an active call */}
            <CallUI />
          </CallProvider>
        </SocketProvider>
        
        {/* Toast notifications */}
        <Toaster position="top-right" />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}