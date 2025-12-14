import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-main">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
