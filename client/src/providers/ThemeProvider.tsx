import { ReactNode, useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  // Hydrate Zustand from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("theme-storage");
    if (stored) {
      try {
        const { theme: storedTheme } = JSON.parse(stored);
        if (storedTheme && storedTheme !== theme) {
          setTheme(storedTheme);
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, [setTheme, theme]);

  // Update DOM and localStorage when Zustand theme changes
  useEffect(() => {
    if (!hydrated) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    localStorage.setItem("theme-storage", JSON.stringify({ theme }));
  }, [theme, hydrated]);

  if (!hydrated) return null; // Prevents flash and mismatch

  return <>{children}</>;
};
