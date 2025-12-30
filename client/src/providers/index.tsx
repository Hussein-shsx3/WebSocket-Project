"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { SocketProvider } from "./SocketProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { Toaster } from "react-hot-toast"; // Or your toast library

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Main Providers wrapper component
 * Wraps all global providers: Theme, React Query, Socket.IO
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
        
        {/* Toast notifications */}
        <Toaster position="top-right" />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}