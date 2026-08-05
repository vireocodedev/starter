import { type AppBrand } from "@/config/app.config.brand";
import { type AppRouteObject, type AppRouteTranslationFn } from "@/config/app.config.routes.types";
import { type QueryKey } from "@tanstack/react-query";
import { type RgoIcon } from "@vireocodedev/starter-ui";
import type React from "react";

export const APP_ROUTE_NODE_KEY: unique symbol = Symbol("appRouteNodeKey");
export const APP_ROUTE_NODE_KIND: unique symbol = Symbol("appRouteNodeKind");

export type AppRouteParamValue = string | number;
export type AppRouteParams = Record<string, string | undefined>;
export type AppRoutePathParams = Record<string, AppRouteParamValue | undefined>;
export type AppConfigPermission = string;
/**
 * Extra context a permission is evaluated against.
 *
 * A permission alone answers "may this role ever do X". Real apps also need
 * "may this user do X *here*" — scoped to the shift they are on duty for, the
 * tenant that owns the record, the site they are assigned to. The starter does
 * not know what those dimensions are, so the scope is an opaque bag that the
 * app's own `canAccess` implementation interprets.
 *
 * @example
 *   canAccess("lockage:finalize", { shiftId: activeShift.id });
 *   canAccess("area:edit", { companyId: area.companyId });
 */
export type AppPermissionScope = Record<string, unknown>;
export type AppConfigTranslationFn = AppRouteTranslationFn;
export type AppConfigLabel<TTranslationFn = AppConfigTranslationFn> = (
  t: TTranslationFn,
  params?: AppRouteParams,
) => string;
export type AppConfigIconName = React.ComponentProps<typeof RgoIcon>["icon"];

export type AppShellNavSlotProps = {
  collapsed: boolean;
  mobile: boolean;
  onNavigate?: () => void;
};

export type AppShellNavControlProps = {
  collapsed?: boolean;
  onClose?: () => void;
};

export type AppPageDefinition<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = {
  routePath: string;
  label: AppConfigLabel<TTranslationFn>;
  icon: AppConfigIconName;
  Component: React.ComponentType;
  permission?: TPermission;
  permissionScope?: AppPermissionScope;
};

export type AppSectionDefinition<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = {
  routePath: string;
  label: AppConfigLabel<TTranslationFn>;
  icon?: AppConfigIconName;
  permission?: TPermission;
  permissionScope?: AppPermissionScope;
};

export type AppPageConfig<
  TKey extends string = string,
  TRoutePath extends string = string,
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = AppPageDefinition<TPermission, TTranslationFn> & {
  readonly [APP_ROUTE_NODE_KIND]: "page";
  readonly [APP_ROUTE_NODE_KEY]: TKey;
  readonly routePath: TRoutePath;
};

export type AppSectionConfig<
  TKey extends string = string,
  TRoutePath extends string = string,
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = AppSectionDefinition<TPermission, TTranslationFn> & {
  readonly [APP_ROUTE_NODE_KIND]: "section";
  readonly [APP_ROUTE_NODE_KEY]: TKey;
  readonly routePath: TRoutePath;
};

export type AppRouteNodeConfig<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> =
  | AppPageConfig<string, string, TPermission, TTranslationFn>
  | AppSectionConfig<string, string, TPermission, TTranslationFn>;

export type AppRouteTreeNode<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> =
  | AppPageConfig<string, string, TPermission, TTranslationFn>
  | {
      node: AppRouteNodeConfig<TPermission, TTranslationFn>;
      redirectTo?: AppPageConfig<string, string, TPermission, TTranslationFn>;
      children?: readonly AppRouteTreeNode<TPermission, TTranslationFn>[];
    };

export type AppRoutePathResolver<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = {
  getPath(page: AppPageConfig<string, string, TPermission, TTranslationFn>, params?: AppRoutePathParams): string;
  getPathPattern(page: AppPageConfig<string, string, TPermission, TTranslationFn>): string;
};

export type AppShellNavEntry<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> =
  | {
      type: "item";
      page?: AppPageConfig<string, string, TPermission, TTranslationFn>;
      to?: string;
      label: AppConfigLabel<TTranslationFn>;
      icon: AppConfigIconName;
      disabled?: boolean;
      disabledTooltip?: AppConfigLabel<TTranslationFn>;
      permission?: TPermission;
      permissionScope?: AppPermissionScope;
    }
  | {
      type: "separator";
      id: string;
      label: AppConfigLabel<TTranslationFn>;
      hideWhenCollapsed?: boolean;
    }
  | {
      type: "control";
      id: string;
      permission?: TPermission;
      permissionScope?: AppPermissionScope;
    }
  | {
      type: "slot";
      id: string;
      permission?: TPermission;
      permissionScope?: AppPermissionScope;
    }
  | {
      type: "divider";
    };

export type AppMobileBottomNavItem<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = {
  value: string;
  page?: AppPageConfig<string, string, TPermission, TTranslationFn>;
  path?: string;
  label: AppConfigLabel<TTranslationFn>;
  icon: AppConfigIconName;
  permission?: TPermission;
  permissionScope?: AppPermissionScope;
};

export type AppShellNavControlConfig<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = {
  label: AppConfigLabel<TTranslationFn>;
  icon: AppConfigIconName;
  Component: React.ComponentType<AppShellNavControlProps>;
  permission?: TPermission;
  permissionScope?: AppPermissionScope;
};

export type AppShellNavSlotConfig = {
  Component: React.ComponentType<AppShellNavSlotProps>;
};

export type AppShellMode = "dashboard" | "public" | "bare";

export type AppConfig<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = {
  brand: AppBrand;
  routes: {
    login: AppRouteObject<TPermission, TTranslationFn>;
    authenticated: AppRouteObject<TPermission, TTranslationFn>[];
    getPath: AppRoutePathResolver<TPermission, TTranslationFn>["getPath"];
    getPathPattern: AppRoutePathResolver<TPermission, TTranslationFn>["getPathPattern"];
    loginPage: AppPageConfig<string, string, TPermission, TTranslationFn>;
    authenticatedEntryPage: AppPageConfig<string, string, TPermission, TTranslationFn>;
    unauthorizedPage: AppPageConfig<string, string, TPermission, TTranslationFn>;
  };
  runtime?: {
    routeChangeQueryKeysToCancel?: readonly QueryKey[];
  };
  shell: {
    mode: AppShellMode;
    navEntries: AppShellNavEntry<TPermission, TTranslationFn>[];
    loginNavEntries: AppShellNavEntry<TPermission, TTranslationFn>[];
    publicNavEntries?: AppShellNavEntry<TPermission, TTranslationFn>[];
    navSlots?: Record<string, AppShellNavSlotConfig>;
    navControls?: Record<string, AppShellNavControlConfig<TPermission, TTranslationFn>>;
    accountSlot?: AppShellNavSlotConfig;
    /**
     * Optional. The mobile bottom bar only exists in `dashboard` mode; a `bare`
     * or `public` app has no use for it and should not be forced to invent one.
     * When omitted, `AppMobileBottomNavigation` renders nothing.
     */
    mobileBottomNavigation?: {
      authenticatedItems: AppMobileBottomNavItem<TPermission, TTranslationFn>[];
      loginItem: AppMobileBottomNavItem<TPermission, TTranslationFn>;
      moreItem: Omit<AppMobileBottomNavItem<TPermission, TTranslationFn>, "path" | "page">;
    };
  };
};
