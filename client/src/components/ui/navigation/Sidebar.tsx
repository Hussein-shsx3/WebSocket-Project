"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  Phone,
  User,
  Settings,
  Moon,
  Sun,
  Users,
  Bookmark,
  LogOut,
} from "lucide-react";
import { useLogout } from "@/hooks/useAuth";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = React.useState(false);
  const logoutMutation = useLogout();

  const navigation = [
    { name: "Chats", href: "/chats", icon: MessageSquare },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Contacts", href: "/contacts", icon: User },
    { name: "Calls", href: "/calls", icon: Phone },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/signIn");
      },
      onError: (error) => {
        console.error("Logout failed:", error);
        router.push("/signIn");
      },
    });
  };

  return (
    <aside className="w-[60px] bg-sidebar flex flex-col items-center py-3 gap-2">
      {/* Logo/Brand */}
      <div className="w-9 h-9 bg-primaryColor rounded-lg flex items-center justify-center mb-2">
        <MessageSquare className="w-5 h-5 text-white" strokeWidth={2} />
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-1 w-full">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                relative w-full h-11 flex items-center justify-center
                transition-colors duration-200
                ${
                  isActive
                    ? "text-primaryColor"
                    : "text-gray-400 hover:text-gray-300"
                }
              `}
              title={item.name}
            >
              {/* Active indicator - left border */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primaryColor rounded-r" />
              )}
              <Icon className="w-5 h-5" strokeWidth={2} />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-1 w-full mb-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full h-11 flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors"
          title="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4" strokeWidth={2} />
          ) : (
            <Moon className="w-4 h-4" strokeWidth={2} />
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full h-11 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
          title="Logout"
        >
          <LogOut className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* User Avatar */}
        <div className="w-full h-11 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primaryColor flex items-center justify-center text-white text-xs font-semibold">
            N
          </div>
        </div>
      </div>
    </aside>
  );
}
