import React from "react";
import { Sidebar } from "../ui/navigation/Sidebar";
import { Panel } from "../ui/display/Panel";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-main">
      <Sidebar />
      <Panel>{children}</Panel>
      <main className="flex-1 flex flex-col overflow-hidden bg-main">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-secondary">
            Select a chat to start messaging
          </p>
        </div>
      </main>
    </div>
  );
}
