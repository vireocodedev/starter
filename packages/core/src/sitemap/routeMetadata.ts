import {
  APP_ROUTE_NODE_KEY,
  APP_ROUTE_NODE_KIND,
  type AppPageConfig,
  type AppRouteNodeConfig,
} from "@/config/app.config.types";

export function defineRouteNodeMetadata<TNode extends object, TKind extends "page" | "section", TKey extends string>(
  node: TNode,
  kind: TKind,
  key: TKey,
): TNode & {
  readonly [APP_ROUTE_NODE_KIND]: TKind;
  readonly [APP_ROUTE_NODE_KEY]: TKey;
} {
  Object.defineProperties(node, {
    [APP_ROUTE_NODE_KIND]: {
      value: kind,
      enumerable: false,
    },
    [APP_ROUTE_NODE_KEY]: {
      value: key,
      enumerable: false,
    },
  });

  return node as TNode & {
    readonly [APP_ROUTE_NODE_KIND]: TKind;
    readonly [APP_ROUTE_NODE_KEY]: TKey;
  };
}

export function getRouteNodeKey(node: AppRouteNodeConfig): string {
  return node[APP_ROUTE_NODE_KEY];
}

export function isAppPageConfig(node: AppRouteNodeConfig): node is AppPageConfig {
  return node[APP_ROUTE_NODE_KIND] === "page";
}
