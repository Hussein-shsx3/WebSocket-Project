import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light", // Always SSR-safe
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === "light" ? "dark" : "light";
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-storage", JSON.stringify({ theme: newTheme }));
    }
    return { theme: newTheme };
  }),
  setTheme: (theme: Theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-storage", JSON.stringify({ theme }));
    }
  },
}));