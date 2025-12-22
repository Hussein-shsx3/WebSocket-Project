"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
<<<<<<< HEAD
import { ThemeProvider } from "./ThemeProvider";
=======
>>>>>>> c2c19e585e68dc55acb5007d7254e2c57657b098

/**
 * Create a client side query client instance
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers wrapper component
<<<<<<< HEAD
 * Wraps React Query QueryClientProvider and ThemeProvider for state management
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
=======
 * Wraps React Query QueryClientProvider for state management
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
>>>>>>> c2c19e585e68dc55acb5007d7254e2c57657b098
  );
}
