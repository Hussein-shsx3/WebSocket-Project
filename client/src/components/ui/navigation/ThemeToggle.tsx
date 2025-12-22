"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="w-full h-11 flex items-center justify-center text-gray-400 hover:text-gray-300 transition-all duration-300 transform hover:scale-110"
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 transition-transform duration-300" strokeWidth={2} />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300" strokeWidth={2} />
      )}
    </button>
  );
}
