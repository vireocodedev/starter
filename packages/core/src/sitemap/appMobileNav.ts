import {
  type AppConfigIconName,
  type AppConfigLabel,
  type AppMobileBottomNavItem,
  type AppPageConfig,
} from "@/config/app.config.types";
import { getRouteNodeKey } from "@/sitemap/routeMetadata";

export const appMobileNav = {
  item(page: AppPageConfig, value = getRouteNodeKey(page)): AppMobileBottomNavItem {
    return {
      value,
      page,
      label: page.label,
      icon: page.icon,
      permission: page.permission,
    };
  },

  more(
    label: AppConfigLabel,
    options?: { value?: string; icon?: AppConfigIconName },
  ): Omit<AppMobileBottomNavItem, "path" | "page"> {
    return {
      value: options?.value ?? "more",
      label,
      icon: options?.icon ?? "dots-vertical",
    };
  },
};
