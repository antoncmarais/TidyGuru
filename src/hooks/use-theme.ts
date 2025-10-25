import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem("tidyguru-theme") as Theme | null;
    if (stored) return stored;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    
    return "dark"; // Default to dark mode
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme
    root.classList.remove("light", "dark");
    
    // Add new theme
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem("tidyguru-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme, setTheme };
};

