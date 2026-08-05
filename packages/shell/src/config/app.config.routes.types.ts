import { type RouteObject } from "react-router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppRouteTranslationFn = (...args: any[]) => string;

export type AppRouteHandle<TPermission extends string = string, TTranslationFn = AppRouteTranslationFn> = {
  breadcrumb: (t: TTranslationFn, params: Record<string, string | undefined>) => string;
  linkable?: boolean;
  permission?: TPermission;
  /**
   * Static context passed alongside `permission` when the guard evaluates it.
   *
   * Scopes that depend on the current user or on route params belong in the
   * app's own `canAccess` implementation, which can read them directly.
   */
  permissionScope?: Record<string, unknown>;
  /**
   * Overrides `config.shell.mode` for this branch of the route tree.
   *
   * The deepest matched override wins. Read by `AppShellModeLayout`.
   */
  shellMode?: "dashboard" | "public" | "bare";
};

export type AppRouteObject<TPermission extends string = string, TTranslationFn = AppRouteTranslationFn> = Omit<
  RouteObject,
  "children" | "handle"
> & {
  children?: AppRouteObject<TPermission, TTranslationFn>[];
  handle?: AppRouteHandle<TPermission, TTranslationFn>;
};
