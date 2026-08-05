import { type AppConfig, type AppShellNavControlConfig, type AppShellNavSlotConfig } from "@/config/app.config.types";
import { AppNavControlItem } from "@/shell/layout/nav/AppNavControlItem";
import { AppNavItem } from "@/shell/layout/nav/AppNavItem";
import { AppNavSeparator } from "@/shell/layout/nav/AppNavSeparator";
import { AppNavSlotItem } from "@/shell/layout/nav/AppNavSlotItem";
import { type NavEntry, type NavTranslationFn } from "@/shell/layout/nav/nav.types";
import { Divider, List } from "@mui/material";
import React from "react";

export function AppNavList({
  collapsedSections,
  config,
  isCollapsed,
  mobile,
  navControls,
  navSlots,
  onNavigate,
  onNavigateTo,
  onOpenControlPopover,
  onToggleSection,
  openControlId,
  pathname,
  t,
  visibleNavEntries,
}: {
  collapsedSections: Record<string, boolean>;
  config: AppConfig;
  isCollapsed: boolean;
  mobile: boolean;
  navControls: Record<string, AppShellNavControlConfig> | undefined;
  navSlots: Record<string, AppShellNavSlotConfig> | undefined;
  onNavigate?: () => void;
  onNavigateTo: (to: string) => void;
  onOpenControlPopover: (controlId: string, event: React.MouseEvent<HTMLElement>) => void;
  onToggleSection: (sectionId: string) => void;
  openControlId?: string;
  pathname: string;
  t: NavTranslationFn;
  visibleNavEntries: NavEntry[];
}) {
  return (
    <List
      sx={theme => ({
        flex: 1,
        overflowY: "auto",
        backgroundColor: "var(--mui-palette-grey-50)",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        scrollbarWidth: "thin",
        scrollbarColor:
          theme.palette.mode === "light"
            ? `${theme.palette.grey[400]} transparent`
            : `${theme.palette.grey[600]} transparent`,
        "&::-webkit-scrollbar": {
          width: 6,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: 999,
          backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[400] : theme.palette.grey[600],
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[500] : theme.palette.grey[500],
        },
      })}
    >
      {visibleNavEntries.map((entry, index) => {
        if (entry.type === "control") {
          const navControl = navControls?.[entry.id];

          if (!navControl) {
            return null;
          }

          return (
            <AppNavControlItem
              key={`control-${entry.id}-${index}`}
              control={navControl}
              controlLabel={navControl.label(t)}
              entry={entry}
              index={index}
              isCollapsed={isCollapsed}
              open={openControlId === entry.id}
              onOpen={onOpenControlPopover}
            />
          );
        }

        if (entry.type === "slot") {
          const slot = navSlots?.[entry.id];

          if (!slot) {
            return null;
          }

          return (
            <AppNavSlotItem
              key={`slot-${entry.id}-${index}`}
              entry={entry}
              index={index}
              isCollapsed={isCollapsed}
              mobile={mobile}
              onNavigate={onNavigate}
              slot={slot}
            />
          );
        }

        if (entry.type === "separator") {
          return (
            <AppNavSeparator
              key={`sep-${entry.id}-${index}`}
              collapsed={isCollapsed}
              entry={entry}
              index={index}
              label={entry.label(t)}
              sectionCollapsed={Boolean(collapsedSections[entry.id])}
              onToggleSection={onToggleSection}
            />
          );
        }

        if (entry.type === "divider") {
          return <Divider key={`divider-${index}`} sx={{ borderColor: "var(--mui-palette-grey-200)", my: 1 }} />;
        }

        const itemLabel = entry.label(t);
        const itemPath = entry.to ?? (entry.page ? config.routes.getPath(entry.page) : undefined);

        return (
          <AppNavItem
            key={`item-${itemLabel}-${index}`}
            disabledTooltip={entry.disabledTooltip?.(t)}
            entry={entry}
            index={index}
            isCollapsed={isCollapsed}
            itemLabel={itemLabel}
            itemPath={itemPath}
            mobile={mobile}
            onNavigateTo={onNavigateTo}
            pathname={pathname}
          />
        );
      })}
    </List>
  );
}
