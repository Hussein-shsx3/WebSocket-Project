"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { AuthProvider } from "./AuthProvider";
import { SocketProvider } from "@/socket/SocketContext";
import { CallProvider } from "./CallProvider";
import { CallOverlay } from "@/components/ui/call/CallOverlay";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <AuthProvider>
          {/* Socket provider - inside AuthProvider to access auth token */}
          <SocketProvider>
            {/* Call provider - inside SocketProvider to access socket */}
            <CallProvider>
              {children}
              {/* Global call overlay */}
              <CallOverlay />
              {/* Toast notifications */}
              <Toaster position="top-right" />
            </CallProvider>
          </SocketProvider>
        </AuthProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
