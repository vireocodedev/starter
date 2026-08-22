export type ShellRouteParamValue = string | number;
export type ShellRouteParams = Readonly<Record<string, ShellRouteParamValue | undefined>>;
export type ShellPermission = string;
export type ShellPermissionScope = Readonly<Record<string, unknown>>;
export type ShellRouteMetadata = Readonly<Record<string, unknown>>;

export type ShellLabel<TContext = unknown> = string | ((context: TContext, params: ShellRouteParams) => string);

export type ShellPageDefinition<
  TPermission extends ShellPermission = ShellPermission,
  TContext = unknown,
  TRoutePath extends string = string,
> = {
  routePath: TRoutePath;
  label: ShellLabel<TContext>;
  icon?: string;
  permission?: TPermission;
  permissionScope?: ShellPermissionScope;
  metadata?: ShellRouteMetadata;
};

export type ShellSectionDefinition<
  TPermission extends ShellPermission = ShellPermission,
  TContext = unknown,
  TRoutePath extends string = string,
> = Omit<ShellPageDefinition<TPermission, TContext, TRoutePath>, "icon"> & {
  icon?: string;
};

export type ShellPage<
  TKey extends string = string,
  TRoutePath extends string = string,
  TPermission extends ShellPermission = ShellPermission,
  TContext = unknown,
> = ShellPageDefinition<TPermission, TContext, TRoutePath> & {
  readonly kind: "page";
  readonly key: TKey;
};

export type ShellSection<
  TKey extends string = string,
  TRoutePath extends string = string,
  TPermission extends ShellPermission = ShellPermission,
  TContext = unknown,
> = ShellSectionDefinition<TPermission, TContext, TRoutePath> & {
  readonly kind: "section";
  readonly key: TKey;
};

export type ShellRouteNode<TPermission extends ShellPermission = ShellPermission, TContext = unknown> =
  ShellPage<string, string, TPermission, TContext> | ShellSection<string, string, TPermission, TContext>;

export type ShellRouteTreeNode<TPermission extends ShellPermission = ShellPermission, TContext = unknown> =
  | ShellPage<string, string, TPermission, TContext>
  | {
      node: ShellRouteNode<TPermission, TContext>;
      redirectTo?: ShellPage<string, string, TPermission, TContext>;
      children?: readonly ShellRouteTreeNode<TPermission, TContext>[];
    };

export type ResolvedShellRoute<TPermission extends ShellPermission = ShellPermission, TContext = unknown> = {
  key: string;
  kind: "page" | "section";
  pathPattern: string;
  parentKey?: string;
  redirectToPattern?: string;
  node: ShellRouteNode<TPermission, TContext>;
};

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
  : TNode extends ShellPage
    ? { page: TNode; path: JoinRoutePath<TParentPath, RouteNodePath<TNode>> }
    : TNode extends { node: infer TConfig; children?: infer TChildren }
      ? TConfig extends ShellRouteNode
        ? TConfig extends ShellPage
          ? | { page: TConfig; path: JoinRoutePath<TParentPath, RouteNodePath<TConfig>> }
            | ShellRouteTreePageEntries<
                Extract<TChildren, readonly ShellRouteTreeNode[]>,
                JoinRoutePath<TParentPath, RouteNodePath<TConfig>>,
                PreviousDepth[TDepth]
              >
          : ShellRouteTreePageEntries<
              Extract<TChildren, readonly ShellRouteTreeNode[]>,
              JoinRoutePath<TParentPath, RouteNodePath<TConfig>>,
              PreviousDepth[TDepth]
            >
        : never
      : never;

export type ShellRouteTreePageEntries<TNodes, TParentPath extends string = "", TDepth extends number = 8> = [
  TDepth,
] extends [never]
  ? never
  : TNodes extends readonly unknown[]
    ? RouteNodePageEntry<TNodes[number], TParentPath, TDepth>
    : never;

export type ShellPathForPage<TNodes extends readonly ShellRouteTreeNode[], TPage extends ShellPage> =
  Extract<ShellRouteTreePageEntries<TNodes>, { page: TPage }> extends { path: infer TPath extends string }
    ? TPath
    : never;

type StripParamSuffix<TParam extends string> = TParam extends `${infer TName}?`
  ? TName
  : TParam extends `${infer TName}*`
    ? TName
    : TParam;

type ExtractRouteTokens<TPath extends string> = TPath extends `${string}:${infer TParam}/${infer TRest}`
  ? TParam | ExtractRouteTokens<TRest>
  : TPath extends `${string}:${infer TParam}`
    ? TParam
    : never;

type OptionalRouteParamNames<TPath extends string> =
  ExtractRouteTokens<TPath> extends infer TToken extends string
    ? TToken extends `${string}?` | `${string}*`
      ? StripParamSuffix<TToken>
      : never
    : never;

type RequiredRouteParamNames<TPath extends string> = Exclude<
  StripParamSuffix<ExtractRouteTokens<TPath>>,
  OptionalRouteParamNames<TPath>
>;

type RoutePathParams<TPath extends string> = {
  [K in RequiredRouteParamNames<TPath>]: ShellRouteParamValue;
} & {
  [K in OptionalRouteParamNames<TPath>]?: ShellRouteParamValue;
};

type RoutePathParamArgs<TPath extends string> = [ExtractRouteTokens<TPath>] extends [never]
  ? []
  : [params: RoutePathParams<TPath>];

export type ShellSitemap<TRoutes extends readonly ShellRouteTreeNode[] = readonly ShellRouteTreeNode[]> = {
  readonly routes: readonly ResolvedShellRoute[];
  getPath<TPage extends ShellRouteTreePageEntries<TRoutes>["page"]>(
    page: TPage,
    ...args: RoutePathParamArgs<ShellPathForPage<TRoutes, TPage>>
  ): string;
  getPathPattern<TPage extends ShellRouteTreePageEntries<TRoutes>["page"]>(
    page: TPage,
  ): ShellPathForPage<TRoutes, TPage>;
  getRoute(key: string): ResolvedShellRoute | undefined;
};
