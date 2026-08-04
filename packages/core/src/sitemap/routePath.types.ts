import { type AppRouteObject } from "@/config/app.config.routes.types";
import { type AppPageConfig, type AppRouteNodeConfig, type AppRouteTreeNode } from "@/config/app.config.types";

type NormalizePath<TPath extends string> = TPath extends `/${infer Rest}`
  ? NormalizePath<Rest>
  : TPath extends `${infer Rest}/`
    ? NormalizePath<Rest>
    : TPath;

type JoinRoutePath<TParent extends string, TChild extends string> =
  NormalizePath<TParent> extends ""
    ? NormalizePath<TChild> extends ""
      ? "/"
      : `/${NormalizePath<TChild>}`
    : NormalizePath<TChild> extends ""
      ? `/${NormalizePath<TParent>}`
      : `/${NormalizePath<TParent>}/${NormalizePath<TChild>}`;

type RouteNodePath<TNode> = TNode extends { routePath: infer TRoutePath extends string } ? TRoutePath : never;

type PreviousDepth = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type RouteNodePageEntry<TNode, TParentPath extends string, TDepth extends number> = [TDepth] extends [never]
  ? never
  : TNode extends AppPageConfig
    ? { page: TNode; path: JoinRoutePath<TParentPath, RouteNodePath<TNode>> }
    : TNode extends { node: infer TConfig; children?: infer TChildren }
      ? TConfig extends AppRouteNodeConfig
        ? TConfig extends AppPageConfig
          ? | { page: TConfig; path: JoinRoutePath<TParentPath, RouteNodePath<TConfig>> }
            | RouteTreePageEntries<
                Extract<TChildren, readonly AppRouteTreeNode[]>,
                JoinRoutePath<TParentPath, RouteNodePath<TConfig>>,
                PreviousDepth[TDepth]
              >
          : RouteTreePageEntries<
              Extract<TChildren, readonly AppRouteTreeNode[]>,
              JoinRoutePath<TParentPath, RouteNodePath<TConfig>>,
              PreviousDepth[TDepth]
            >
        : never
      : never;

export type RouteTreePageEntries<TNodes, TParentPath extends string = "", TDepth extends number = 8> = [
  TDepth,
] extends [never]
  ? never
  : TNodes extends readonly unknown[]
    ? RouteNodePageEntry<TNodes[number], TParentPath, TDepth>
    : never;

export type RoutePathForPage<TNodes extends readonly AppRouteTreeNode[], TPage extends AppPageConfig> =
  Extract<RouteTreePageEntries<TNodes>, { page: TPage }> extends { path: infer TPath extends string } ? TPath : never;

type StripParamSuffix<TParam extends string> = TParam extends `${infer TName}?`
  ? TName
  : TParam extends `${infer TName}*`
    ? TName
    : TParam;

type ExtractRouteParamNames<TPath extends string> = TPath extends `${string}:${infer TParam}/${infer TRest}`
  ? StripParamSuffix<TParam> | ExtractRouteParamNames<TRest>
  : TPath extends `${string}:${infer TParam}`
    ? StripParamSuffix<TParam>
    : never;

type RoutePathParams<TPath extends string> = {
  [K in ExtractRouteParamNames<TPath>]: string | number;
};

type RoutePathParamArgs<TPath extends string> = [ExtractRouteParamNames<TPath>] extends [never]
  ? []
  : [params: RoutePathParams<TPath>];

export type AppRouteRegistry<TRoutes extends readonly AppRouteTreeNode[]> = {
  routes: AppRouteObject[];
  getPath<TPage extends RouteTreePageEntries<TRoutes>["page"]>(
    page: TPage,
    ...args: RoutePathParamArgs<RoutePathForPage<TRoutes, TPage>>
  ): string;
  getPathPattern<TPage extends RouteTreePageEntries<TRoutes>["page"]>(page: TPage): RoutePathForPage<TRoutes, TPage>;
};
