"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Phone,
  User,
  Settings,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "../buttons";

export function Sidebar() {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const navigation = [
    { name: "Chats", href: "/chats", icon: MessageSquare },
    { name: "Friend Requests", href: "/friendsRequests", icon: UserPlus },
    { name: "Contacts", href: "/contacts", icon: User },
    { name: "Calls", href: "/calls", icon: Phone },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Main navigation shown in the compact mobile bar (without Settings)
  const mobileNavigation = navigation.filter(
    (item) => item.name !== "Settings"
  );

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Desktop / Tablet sidebar on the left */}
      <aside className="hidden sm:flex w-[60px] bg-sidebar flex-col items-center py-3 gap-2">
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
          <ThemeToggle />
          {/* Logout Button */}
          <LogoutButton />
          {/* User Avatar - Link to Profile on Desktop */}
          <div className="w-full h-11 flex items-center justify-center">
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full bg-primaryColor flex items-center justify-center text-white text-xs font-semibold hover:opacity-80 transition-opacity"
              title="Profile"
            >
              N
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile bottom bar under the page content */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-border py-2 flex items-center justify-center w-full">
        {/* Main paths with percentage widths - 4 items × 20% = 80% */}
        {mobileNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                relative w-[20%] h-12 flex items-center justify-center
                transition-colors duration-200
                ${
                  isActive
                    ? "text-primaryColor bg-primaryColor/10"
                    : "text-gray-400 hover:text-gray-300"
                }
              `}
              title={item.name}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </Link>
          );
        })}

        {/* User avatar with dropdown menu (Profile + Settings + Theme Toggle + Logout) - 20% width */}
        <div ref={avatarRef} className="relative w-[20%] h-12 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((open) => !open)}
            className="w-9 h-9 rounded-full bg-primaryColor flex items-center justify-center text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primaryColor/60"
          >
            N
          </button>

          {isUserMenuOpen && (
            <>
              {/* Backdrop overlay */}
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                onClick={() => setIsUserMenuOpen(false)}
              />
              
              {/* Dropdown menu */}
              <div className="absolute bottom-12 right-0 w-40 rounded-lg bg-popover shadow-lg border border-border py-2 flex flex-col gap-1 z-50">
                <Link
                  href="/profile"
                  className="px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                
                <Link
                  href="/settings"
                  className="px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>

                {/* Theme Toggle in dropdown */}
                <div className="px-3 py-2">
                  <ThemeToggle />
                </div>

                <div className="px-2">
                  <LogoutButton />
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
