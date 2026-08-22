import { z } from "zod";
import { generateShellPath, joinRoutePattern } from "./routePath";
import type {
  ResolvedShellRoute,
  ShellPage,
  ShellPageDefinition,
  ShellPermission,
  ShellRouteNode,
  ShellRouteTreeNode,
  ShellSection,
  ShellSectionDefinition,
  ShellSitemap,
} from "./shellSitemap.types";

export const ShellRouteKeySchema = z.string().trim().min(1, "Route keys cannot be blank.");
export const ShellRoutePathSchema = z
  .string()
  .refine(path => !path.startsWith("/"), "Route paths must be local segments without a leading slash.")
  .refine(path => !path.includes("//"), "Route paths cannot contain empty segments.");

type StrictConfig<TConfig, TShape> = TConfig & Record<Exclude<keyof TConfig, keyof TShape>, never>;
type StrictConfigRecord<TRecord, TShape> = {
  readonly [K in keyof TRecord]: StrictConfig<TRecord[K], TShape>;
};

type ShellPageRecord<
  TPages extends Record<string, ShellPageDefinition<TPermission, TContext>>,
  TPermission extends ShellPermission,
  TContext,
> = {
  readonly [K in keyof TPages]: ShellPage<K & string, TPages[K]["routePath"], TPermission, TContext> & TPages[K];
};

type ShellSectionRecord<
  TSections extends Record<string, ShellSectionDefinition<TPermission, TContext>>,
  TPermission extends ShellPermission,
  TContext,
> = {
  readonly [K in keyof TSections]: ShellSection<K & string, TSections[K]["routePath"], TPermission, TContext> &
    TSections[K];
};

function defineNodes<TKind extends "page" | "section">(
  definitions: Readonly<Record<string, { routePath: string }>>,
  kind: TKind,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(definitions).map(([key, definition]) => {
      const parsedKey = ShellRouteKeySchema.parse(key);
      ShellRoutePathSchema.parse(definition.routePath);
      return [key, Object.freeze({ ...definition, kind, key: parsedKey })];
    }),
  );
}

export function defineShellPages<
  TPermission extends ShellPermission = ShellPermission,
  TContext = unknown,
  const TPages extends Record<string, ShellPageDefinition<TPermission, TContext>> = Record<
    string,
    ShellPageDefinition<TPermission, TContext>
  >,
>(
  pages: StrictConfigRecord<TPages, ShellPageDefinition<TPermission, TContext>>,
): ShellPageRecord<TPages, TPermission, TContext> {
  return defineNodes(pages, "page") as unknown as ShellPageRecord<TPages, TPermission, TContext>;
}

export function defineShellSections<
  TPermission extends ShellPermission = ShellPermission,
  TContext = unknown,
  const TSections extends Record<string, ShellSectionDefinition<TPermission, TContext>> = Record<
    string,
    ShellSectionDefinition<TPermission, TContext>
  >,
>(
  sections: StrictConfigRecord<TSections, ShellSectionDefinition<TPermission, TContext>>,
): ShellSectionRecord<TSections, TPermission, TContext> {
  return defineNodes(sections, "section") as unknown as ShellSectionRecord<TSections, TPermission, TContext>;
}

function isDirectNode(node: ShellRouteTreeNode): node is ShellPage {
  return "kind" in node;
}

export function createShellSitemap<const TRoutes extends readonly ShellRouteTreeNode[]>(
  tree: TRoutes,
): ShellSitemap<TRoutes> {
  const pagePatterns = new Map<string, string>();
  const routesByKey = new Map<string, ResolvedShellRoute>();
  const pathOwners = new Map<string, string>();
  const pendingRedirects: Array<{ route: ResolvedShellRoute; target: ShellPage }> = [];

  function visit(nodes: readonly ShellRouteTreeNode[], parentPattern: string, parentKey?: string): void {
    nodes.forEach(treeNode => {
      const node: ShellRouteNode = isDirectNode(treeNode) ? treeNode : treeNode.node;
      ShellRouteKeySchema.parse(node.key);
      ShellRoutePathSchema.parse(node.routePath);

      if (routesByKey.has(node.key)) throw new Error(`Route key "${node.key}" is mounted more than once.`);
      const pathPattern = joinRoutePattern(parentPattern, node.routePath);
      const existingPathOwner = pathOwners.get(pathPattern);
      if (existingPathOwner) {
        throw new Error(`Route pattern "${pathPattern}" is shared by "${existingPathOwner}" and "${node.key}".`);
      }

      const route: ResolvedShellRoute = { key: node.key, kind: node.kind, pathPattern, parentKey, node };
      routesByKey.set(node.key, route);
      pathOwners.set(pathPattern, node.key);
      if (node.kind === "page") pagePatterns.set(node.key, pathPattern);

      if (!isDirectNode(treeNode)) {
        if (treeNode.redirectTo) pendingRedirects.push({ route, target: treeNode.redirectTo });
        if (treeNode.children) visit(treeNode.children, pathPattern, node.key);
      }
    });
  }

  visit(tree, "");
  pendingRedirects.forEach(({ route, target }) => {
    const targetPattern = pagePatterns.get(target.key);
    if (!targetPattern) throw new Error(`Redirect target "${target.key}" is not mounted in the sitemap.`);
    route.redirectToPattern = targetPattern;
  });

  const sitemap: ShellSitemap<TRoutes> = {
    routes: Object.freeze([...routesByKey.values()]),
    getPath(page, ...args) {
      const pattern = sitemap.getPathPattern(page);
      return generateShellPath(pattern, args[0]);
    },
    getPathPattern(page) {
      const pattern = pagePatterns.get(page.key);
      if (!pattern) throw new Error(`Page "${page.key}" is not mounted in the sitemap.`);
      return pattern as never;
    },
    getRoute(key) {
      return routesByKey.get(key);
    },
  };

  return sitemap;
}
