import { type AppShellNavControlConfig } from "@/config/app.config.types";
import { type NavControlEntry } from "@/shell/layout/nav/nav.types";
import {
  collapsedNavIconSx,
  collapsedNavItemSx,
  collapsedNavTextProps,
  collapsedNavTextSx,
  expandedNavIconSx,
  navIcon,
} from "@/shell/layout/nav/nav.utils";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import type React from "react";

export function AppNavControlItem({
  control,
  controlLabel,
  entry,
  index,
  isCollapsed,
  open,
  onOpen,
}: {
  control: AppShellNavControlConfig;
  controlLabel: string;
  entry: NavControlEntry;
  index: number;
  isCollapsed: boolean;
  open: boolean;
  onOpen: (controlId: string, event: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <ListItemButton
      key={`control-${entry.id}-${index}`}
      onClick={event => onOpen(entry.id, event)}
      selected={open}
      sx={isCollapsed ? collapsedNavItemSx : { pl: 2, pr: 1.25 }}
    >
      <ListItemIcon sx={isCollapsed ? collapsedNavIconSx : expandedNavIconSx}>{navIcon(control.icon)}</ListItemIcon>
      <ListItemText
        primary={controlLabel}
        sx={isCollapsed ? collapsedNavTextSx : undefined}
        primaryTypographyProps={isCollapsed ? collapsedNavTextProps : undefined}
      />
    </ListItemButton>
  );
}
