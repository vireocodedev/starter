import {
  type AppConfigIconName,
  type AppConfigLabel,
  type AppConfigPermission,
  type AppConfigTranslationFn,
  type AppPageConfig,
  type AppPermissionScope,
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
      permissionScope: page.permissionScope,
    };
  },

  disabledItem<TPermission extends AppConfigPermission = AppConfigPermission, TTranslationFn = AppConfigTranslationFn>({
    label,
    icon,
    disabledTooltip,
    permission,
    permissionScope,
  }: {
    label: AppConfigLabel<TTranslationFn>;
    icon: AppConfigIconName;
    disabledTooltip: AppConfigLabel<TTranslationFn>;
    permission?: TPermission;
    permissionScope?: AppPermissionScope;
  }): AppShellNavEntry<TPermission, TTranslationFn> {
    return {
      type: "item",
      label,
      icon,
      disabled: true,
      disabledTooltip,
      permission,
      permissionScope,
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

  control(
    id: string,
    options?: { permission?: AppConfigPermission; permissionScope?: AppPermissionScope },
  ): AppShellNavEntry {
    return {
      type: "control",
      id,
      permission: options?.permission,
      permissionScope: options?.permissionScope,
    };
  },

  slot(
    id: string,
    options?: { permission?: AppConfigPermission; permissionScope?: AppPermissionScope },
  ): AppShellNavEntry {
    return {
      type: "slot",
      id,
      permission: options?.permission,
      permissionScope: options?.permissionScope,
    };
  },
};
