"use client";

import { useEffect, useState } from "react";
import { FaSun } from "react-icons/fa";
import { cn } from "@/utils/cn";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-md">
        <span className="sr-only">Theme</span>
      </div>
    );
  }

  // Just render the light theme icon since we're only using light theme
  return (
    <div
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-md",
        "bg-gray-100"
      )}
      aria-label="Light theme"
    >
      <FaSun className="h-4 w-4 text-yellow-500" />
      <span className="sr-only">Light theme</span>
    </div>
  );
} 