import {
  BellIcon,
  BookIcon,
  BoxIcon,
  CategoryIcon,
  ComponentDrivenIcon,
  ComponentIcon,
  ControlsIcon,
  DashboardIcon,
  DatabaseIcon,
  DirectionIcon,
  DocumentIcon,
  DragIcon,
  FormIcon,
  GlobeIcon,
  GridIcon,
  LightningIcon,
  ListOrderedIcon,
  RSSIcon,
  SearchIcon,
  SidebarIcon,
  StackedIcon,
  StatusIcon,
  SyncIcon,
  TimeIcon,
  TransferIcon,
  WrenchIcon,
  ZoomIcon,
} from "@storybook/icons";
import { vireoStorybookTheme } from "./storybook-theme";
import { addons } from "storybook/manager-api";
import type { API_HashEntry } from "storybook/internal/types";
import React from "react";

type SidebarIcon = React.ComponentType<{ "aria-hidden"?: boolean; size?: number }>;

const SIDEBAR_ICONS: Readonly<Record<string, SidebarIcon>> = {
  Documentation: BookIcon,
  Guides: DocumentIcon,
  UI: ComponentIcon,
  Core: BoxIcon,
  Behavior: LightningIcon,
  Controls: ControlsIcon,
  "Data Display": DashboardIcon,
  Feedback: StatusIcon,
  Hooks: WrenchIcon,
  Layout: GridIcon,
  Navigation: DirectionIcon,
  Providers: ComponentDrivenIcon,
  Surfaces: StackedIcon,
  Capabilities: CategoryIcon,
  Countries: GlobeIcon,
  Forms: FormIcon,
  History: TimeIcon,
  Infrastructure: WrenchIcon,
  "Infinite Canvas": ZoomIcon,
  Overlays: StackedIcon,
  "Page Layout": SidebarIcon,
  Tables: DatabaseIcon,
  Fields: ControlsIcon,
  "Multi-Step": ListOrderedIcon,
  Integrations: TransferIcon,
  "Drag and Drop · Hello Pangea DND": DragIcon,
  "Event Source": RSSIcon,
  Localization: GlobeIcon,
  "Query Engine": SearchIcon,
  SQLite: DatabaseIcon,
  Shell: SidebarIcon,
  "Notifications · Sonner": BellIcon,
  "TanStack Query": SyncIcon,
};

function renderSidebarLabel(item: API_HashEntry): React.ReactNode {
  if (item.type !== "root" && item.type !== "group") return item.name;

  const Icon = SIDEBAR_ICONS[item.name];
  if (!Icon) return item.name;

  return React.createElement(
    "span",
    { className: `vireo-sidebar-label vireo-sidebar-label--${item.type}` },
    React.createElement(Icon, { "aria-hidden": true, size: 14 }),
    React.createElement("span", null, item.name),
  );
}

addons.setConfig({
  theme: vireoStorybookTheme,
  sidebar: {
    showRoots: true,
    renderLabel: renderSidebarLabel,
  },
});
