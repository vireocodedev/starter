import {
  type AppConfigIconName,
  type AppConfigLabel,
  type AppConfigPermission,
  type AppPageConfig,
  type AppShellNavEntry,
} from "@/config/app.config.types";

export const appNav = {
  item(page: AppPageConfig): AppShellNavEntry {
    return {
      type: "item",
      page,
      label: page.label,
      icon: page.icon,
      permission: page.permission,
    };
  },

  disabledItem({
    label,
    icon,
    disabledTooltip,
    permission,
  }: {
    label: AppConfigLabel;
    icon: AppConfigIconName;
    disabledTooltip: AppConfigLabel;
    permission?: AppConfigPermission;
  }): AppShellNavEntry {
    return {
      type: "item",
      label,
      icon,
      disabled: true,
      disabledTooltip,
      permission,
    };
  },

  separator(id: string, label: AppConfigLabel, options?: { hideWhenCollapsed?: boolean }): AppShellNavEntry {
    return {
      type: "separator",
      id,
      label,
      hideWhenCollapsed: options?.hideWhenCollapsed,
    };
  },

  divider(): AppShellNavEntry {
    return {
      type: "divider",
    };
  },

  control(id: string, options?: { permission?: AppConfigPermission }): AppShellNavEntry {
    return {
      type: "control",
      id,
      permission: options?.permission,
    };
  },

  slot(id: string, options?: { permission?: AppConfigPermission }): AppShellNavEntry {
    return {
      type: "slot",
      id,
      permission: options?.permission,
    };
  },
};
