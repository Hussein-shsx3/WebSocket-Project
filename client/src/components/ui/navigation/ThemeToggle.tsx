"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

interface ThemeToggleProps {
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  if (showLabel) {
    return (
      <button
        onClick={toggleTheme}
        className="w-full flex items-center gap-3 py-2 text-sm text-primary hover:text-primaryColor transition-colors"
        title="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-primaryColor" strokeWidth={2} />
        ) : (
          <Moon className="w-5 h-5 text-primaryColor" strokeWidth={2} />
        )}
        <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-full h-12 flex items-center justify-center text-secondary hover:text-primary hover:bg-hover rounded-xl transition-all duration-200"
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 transition-transform duration-300" strokeWidth={2} />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300" strokeWidth={2} />
      )}
    </button>
  );
}
