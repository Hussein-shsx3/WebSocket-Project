"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        {children}
        {/* Toast notifications */}
        <Toaster position="top-right" />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
