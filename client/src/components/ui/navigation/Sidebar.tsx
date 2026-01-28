"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  MessageSquareText,
  // Phone,
  User,
  Settings,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "../buttons";
import { LogoutButton } from "../buttons";
import { useUserProfile } from "@/hooks/useUserProfile";

export function Sidebar() {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const { data: user } = useUserProfile();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 
      ? parts[0][0] + parts[parts.length - 1][0] 
      : parts[0]?.[0] || '';
  };

  const navigation = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Chats", href: "/chats", icon: MessageSquare },
    { name: "Friend Requests", href: "/friendsRequests", icon: UserPlus },
    // { name: "Calls", href: "/calls", icon: Phone },
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
      <aside className="hidden sm:flex w-[76px] bg-sidebar flex-col items-center py-4 gap-3">
        {/* Logo/Brand */}
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquareText className="w-7 h-7 text-primaryColor" strokeWidth={2} />
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-0">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative w-full h-12 flex items-center justify-center rounded-xl
                  transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-primaryColor/10 text-primaryColor"
                      : "text-secondary hover:text-[#e1e9f0]"
                  }
                `}
                title={item.name}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3.5px] h-5 bg-primaryColor rounded-full" />
                )}
                <Icon className="w-6 h-6" strokeWidth={2} />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 w-full px-2 mb-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          {/* Logout Button */}
          <LogoutButton />
          {/* User Avatar - Link to Profile on Desktop */}
          <div className="w-full flex items-center justify-center mt-2">
            <Link
              href="/profile"
              className="relative w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold hover:shadow-lg hover:shadow-primaryColor/20 transition-all duration-200 hover:scale-105 overflow-hidden"
              title="Profile"
            >
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  fill
                  className="rounded-full object-cover"
                  sizes="44px"
                  loading="eager"
                />
              ) : (
                <span className="bg-primaryColor w-full h-full flex items-center justify-center">
                  {getInitials(user?.name || "")}
                </span>
              )}
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile bottom bar under the page content */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar/95 backdrop-blur-lg border-t border-border py-2 px-2 flex items-center justify-around w-full safe-area-bottom">
        {mobileNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                relative h-12 w-14 flex flex-col items-center justify-center gap-1 rounded-xl
                transition-all duration-200
                ${
                  isActive
                    ? "text-primaryColor"
                    : "text-secondary"
                }
              `}
              title={item.name}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                isActive ? "bg-primaryColor/10" : ""
              }`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
            </Link>
          );
        })}

        {/* User avatar with dropdown menu */}
        <div ref={avatarRef} className="relative h-12 w-12 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((open) => !open)}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primaryColor/50 shadow-lg shadow-primaryColor/20 overflow-hidden"
          >
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="User Avatar"
                fill
                className="rounded-full object-cover"
                sizes="40px"
                loading="eager"
              />
            ) : (
              <span className="bg-primaryColor w-full h-full flex items-center justify-center">
                {getInitials(user?.name || "")}
              </span>
            )}
          </button>

          {isUserMenuOpen && (
            <>    
              {/* Dropdown menu */}
              <div className="absolute bottom-14 right-0 w-40 rounded-2xl bg-popover shadow-2xl border border-border py-2 flex flex-col z-50 overflow-hidden">
                <Link
                  href="/profile"
                  className="w-full px-4 py-3 text-sm flex items-center gap-3 hover:bg-hover transition-colors text-primary"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-primaryColor" />
                  <span className="font-medium">Profile</span>
                </Link>
                
                <Link
                  href="/settings"
                  className="w-full px-4 py-3 text-sm flex items-center gap-3 hover:bg-hover transition-colors text-primary"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 text-primaryColor" />
                  <span className="font-medium">Settings</span>
                </Link>

                <div className="h-px bg-border/50 my-1" />

                {/* Theme Toggle in dropdown */}
                <div className="w-full px-4 py-2">
                  <ThemeToggle showLabel />
                </div>

                <div className="h-px bg-border my-1" />

                <div className="w-full">
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
