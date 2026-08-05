import {
  type AppConfigIconName,
  type AppConfigLabel,
  type AppConfigTranslationFn,
  type AppMobileBottomNavItem,
  type AppPageConfig,
} from "@/config/app.config.types";
import { getRouteNodeKey } from "@/sitemap/routeMetadata";

export const appMobileNav = {
  item<TPermission extends string = string, TTranslationFn = AppConfigTranslationFn>(
    page: AppPageConfig<string, string, TPermission, TTranslationFn>,
    value = getRouteNodeKey(page as AppPageConfig),
  ): AppMobileBottomNavItem<TPermission, TTranslationFn> {
    return {
      value,
      page,
      label: page.label,
      icon: page.icon,
      permission: page.permission,
    };
  },

  more<TPermission extends string = string, TTranslationFn = AppConfigTranslationFn>(
    label: AppConfigLabel<TTranslationFn>,
    options?: { value?: string; icon?: AppConfigIconName },
  ): Omit<AppMobileBottomNavItem<TPermission, TTranslationFn>, "path" | "page"> {
    return {
      value: options?.value ?? "more",
      label,
      icon: options?.icon ?? "dots-vertical",
    };
  },
};
