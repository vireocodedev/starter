import {
  type AppConfigIconName,
  type AppConfigLabel,
  type AppConfigPermission,
  type AppConfigTranslationFn,
  type AppPageConfig,
  type AppShellNavEntry,
} from "@/config/app.config.types";

export const appNav = {
  item<TPermission extends AppConfigPermission = AppConfigPermission, TTranslationFn = AppConfigTranslationFn>(
    page: AppPageConfig<string, string, TPermission, TTranslationFn>,
  ): AppShellNavEntry<TPermission, TTranslationFn> {
    return {
      type: "item",
      page,
      label: page.label,
      icon: page.icon,
      permission: page.permission,
    };
  },

  disabledItem<TPermission extends AppConfigPermission = AppConfigPermission, TTranslationFn = AppConfigTranslationFn>({
    label,
    icon,
    disabledTooltip,
    permission,
  }: {
    label: AppConfigLabel<TTranslationFn>;
    icon: AppConfigIconName;
    disabledTooltip: AppConfigLabel<TTranslationFn>;
    permission?: TPermission;
  }): AppShellNavEntry<TPermission, TTranslationFn> {
    return {
      type: "item",
      label,
      icon,
      disabled: true,
      disabledTooltip,
      permission,
    };
  },

  separator<TPermission extends AppConfigPermission = AppConfigPermission, TTranslationFn = AppConfigTranslationFn>(
    id: string,
    label: AppConfigLabel<TTranslationFn>,
    options?: { hideWhenCollapsed?: boolean },
  ): AppShellNavEntry<TPermission, TTranslationFn> {
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
