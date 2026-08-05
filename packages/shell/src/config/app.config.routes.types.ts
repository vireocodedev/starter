import { type RouteObject } from "react-router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppRouteTranslationFn = (...args: any[]) => string;

export type AppRouteHandle<TPermission extends string = string, TTranslationFn = AppRouteTranslationFn> = {
  breadcrumb: (t: TTranslationFn, params: Record<string, string | undefined>) => string;
  linkable?: boolean;
  permission?: TPermission;
};

export type AppRouteObject<TPermission extends string = string, TTranslationFn = AppRouteTranslationFn> = Omit<
  RouteObject,
  "children" | "handle"
> & {
  children?: AppRouteObject<TPermission, TTranslationFn>[];
  handle?: AppRouteHandle<TPermission, TTranslationFn>;
};
