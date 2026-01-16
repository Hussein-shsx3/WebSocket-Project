"use client";

import React from "react";
import { Sidebar } from "../ui/navigation/Sidebar";
import { Panel } from "./Panel";
import Chat from "../pages/main/chats/chat";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isConversationPage = pathname?.startsWith("/chats/") && pathname !== "/chats";

  return (
    <div className="h-screen w-full flex overflow-hidden bg-main">
      <Sidebar />
      <Panel>
        {children}
      </Panel>
      {isConversationPage && (
        <main className="flex-1 flex flex-col overflow-hidden">
          <Chat />
        </main>
      )}
    </div>
  );
}