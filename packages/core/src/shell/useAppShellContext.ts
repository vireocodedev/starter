import { AppShellContext, type AppShellContextValue } from "@/shell/AppShellContext";
import React from "react";

export function useAppShellContext(): AppShellContextValue {
  const context = React.useContext(AppShellContext);

  if (!context) {
    throw new Error("useAppShellContext must be used within AppShellProvider.");
  }

  return context;
}
