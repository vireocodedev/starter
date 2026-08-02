import { type NavEntry, type NavIconName } from "@/shell/layout/nav/nav.types";
import { RgoIcon } from "@vireocodedev/starter-ui";
import React from "react";

export function navIcon(icon: NavIconName): React.ReactNode {
  return <RgoIcon icon={icon} width={20} height={20} />;
}

function isRenderableNavEntry(entry: NavEntry): boolean {
  return entry.type === "item" || entry.type === "control" || entry.type === "slot";
}

function hasRenderableEntryBefore(entries: NavEntry[], index: number): boolean {
  return entries.slice(0, index).some(isRenderableNavEntry);
}

function hasRenderableEntryAfter(entries: NavEntry[], index: number): boolean {
  return entries.slice(index + 1).some(isRenderableNavEntry);
}

function hasRenderableEntryUntilSectionBreak(entries: NavEntry[], index: number): boolean {
  for (const entry of entries.slice(index + 1)) {
    if (entry.type === "separator" || entry.type === "divider") {
      return false;
    }

    if (isRenderableNavEntry(entry)) {
      return true;
    }
  }

  return false;
}

export function compactNavEntries(entries: NavEntry[]): NavEntry[] {
  const entriesWithVisibleSections = entries.filter((entry, index) => {
    if (entry.type !== "separator") {
      return true;
    }

    return hasRenderableEntryUntilSectionBreak(entries, index);
  });

  return entriesWithVisibleSections.filter((entry, index) => {
    if (entry.type !== "divider") {
      return true;
    }

    return (
      hasRenderableEntryBefore(entriesWithVisibleSections, index) &&
      hasRenderableEntryAfter(entriesWithVisibleSections, index)
    );
  });
}

export const collapsedNavItemSx = {
  minHeight: 64,
  pt: 1.5,
  pb: 0.75,
  px: 0.5,
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 0.35,
} as const;

export const collapsedNavIconSx = {
  minWidth: 0,
  justifyContent: "center",
  lineHeight: 1,
  color: "inherit",
} as const;

export const expandedNavIconSx = {
  minWidth: 32,
  mr: 1,
  color: "inherit",
} as const;

export const collapsedNavTextSx = { width: "100%", minWidth: 0 } as const;

export const collapsedNavTextProps = {
  variant: "caption" as const,
  textAlign: "center" as const,
  lineHeight: 1.1,
  sx: {
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },
};
