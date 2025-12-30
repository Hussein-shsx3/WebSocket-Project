"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "../ui/navigation/Sidebar";
import { Panel } from "../ui/display/Panel";
import Chat from "../pages/main/chat";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  // Check if we're on a conversation page (e.g., /chats/[conversationId])
  const isConversationPage =
    pathname?.startsWith("/chats/") && pathname !== "/chats";
  const conversationId = isConversationPage
    ? pathname.split("/chats/")[1]
    : null;

  return (
    <div className="h-screen w-full flex overflow-hidden bg-main">
      <Sidebar />
      {/* On small screens, when a conversationId exists we show the Chat inside the Panel (full-width).
          On md+ screens we keep the Panel showing the children and render Chat in the right-side main area. */}
      <Panel>
        {/*
          Always render the chats `children` for md+ screens.
          When a conversationId exists we want to show the Chat full-width on small screens
          and keep the chats list visible on md+ screens. To achieve that we:
          - hide children on small screens when conversationId is present
          - render Chat inside the panel only on small screens
        */}
        <div className={conversationId ? "hidden md:block" : "block"}>{children}</div>

        {conversationId && (
          <div className="md:hidden w-full h-[91%]">
            <Chat conversationId={conversationId} />
          </div>
        )}
      </Panel>
      <main className="hidden md:flex flex-1 flex-col overflow-hidden bg-main">
        {conversationId ? (
          <Chat conversationId={conversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-secondary">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
