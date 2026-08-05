import { type AppShellNavControlConfig, type AppShellNavSlotConfig } from "@/config/app.config.types";
import { type NavEntry } from "@/shell/layout/nav/nav.types";
import { compactNavEntries } from "@/shell/layout/nav/nav.utils";
import React from "react";

export function useVisibleNavEntries({
  canAccess,
  collapsedSections,
  isCollapsed,
  loginMode,
  loginNavEntries,
  navControls,
  navEntries,
  navSlots,
}: {
  canAccess: (permission: string | undefined) => boolean;
  collapsedSections: Record<string, boolean>;
  isCollapsed: boolean;
  loginMode: boolean;
  loginNavEntries: NavEntry[];
  navControls: Record<string, AppShellNavControlConfig> | undefined;
  navEntries: NavEntry[];
  navSlots: Record<string, AppShellNavSlotConfig> | undefined;
}): NavEntry[] {
  const compactEntries = React.useMemo<NavEntry[]>(() => {
    const entries = loginMode ? loginNavEntries : navEntries;

    const visibleEntries = entries.filter(entry => {
      if (entry.type === "control" && !navControls?.[entry.id]) {
        return false;
      }

      if (entry.type === "control" && !canAccess(entry.permission)) {
        return false;
      }

      if (entry.type === "control" && !canAccess(navControls?.[entry.id]?.permission)) {
        return false;
      }

      if (entry.type === "slot" && !navSlots?.[entry.id]) {
        return false;
      }

      if (entry.type === "slot" && !canAccess(entry.permission)) {
        return false;
      }

      if (entry.type === "item" && !canAccess(entry.permission)) {
        return false;
      }

      return !(entry.type === "separator" && entry.hideWhenCollapsed && isCollapsed);
    });

    return compactNavEntries(visibleEntries);
  }, [canAccess, isCollapsed, loginMode, loginNavEntries, navControls, navEntries, navSlots]);

  return React.useMemo(() => {
    let currentSectionId: string | null = null;

    return compactEntries.filter(entry => {
      if (entry.type === "separator") {
        currentSectionId = entry.id;
        return true;
      }

      if (entry.type === "divider") {
        currentSectionId = null;
        return true;
      }

      if (currentSectionId && collapsedSections[currentSectionId]) {
        return false;
      }

      return true;
    });
  }, [compactEntries, collapsedSections]);
}
