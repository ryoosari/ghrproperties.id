"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { cn } from "@/utils/cn";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-md">
        <span className="sr-only">Toggle theme</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-md transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <FaSun className="h-4 w-4 text-yellow-500" />
      ) : (
        <FaMoon className="h-4 w-4 text-gray-700" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
} 