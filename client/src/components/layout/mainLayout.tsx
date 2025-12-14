import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout Component
 * 
 * Structure:
 * - Sidebar (left) - Navigation icons
 * - Panel (middle ~30%) - Route-specific content (chats list, profile, calls, etc.)
 * - Main (right ~70%) - Chat content when viewing specific chat
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-main">
      {/* Sidebar - Left (Always visible) */}
      <aside className="w-20 bg-sidebar border-r border-border flex flex-col items-center py-4 gap-6">
        {/* Sidebar will contain: 
          - Logo/Brand icon
          - Navigation icons (chats, calls, profile, settings)
          - User avatar at bottom
        */}
      </aside>

      {/* Panel Section - Middle (~30%) (Changes based on route) */}
      <section className="w-1/3 bg-panel border-r border-border flex flex-col overflow-hidden">
        {/* Panel content changes: chats list, profile, calls, etc. */}
        {children}
      </section>

      {/* Main Section - Right (~70%) (Only shows chat when chatId exists) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-header border-b border-border flex items-center px-6">
          {/* Header content - Shows selected chat name, call buttons, search, etc. */}
        </header>

        {/* Main Content Area - Shows specific chat or empty */}
        <div className="flex-1 overflow-auto flex items-center justify-center">
          {/* Chat component will be displayed here based on [chatId] route */}
          <div className="text-text-secondary">
            {/* Empty state when no chat is selected */}
          </div>
        </div>
      </main>
    </div>
  );
}
