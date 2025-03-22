"use client";

import * as React from "react";

// Simple theme provider that doesn't depend on next-themes
export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  // We're just passing the children without any theme logic
  // since we're only using light theme based on the forcedTheme setting
  return <>{children}</>;
} 