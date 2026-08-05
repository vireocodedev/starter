import { type AppRouteObject } from "@/config/app.config.routes.types";
import {
  APP_ROUTE_NODE_KIND,
  type AppPageConfig,
  type AppRouteNodeConfig,
  type AppRouteParams,
  type AppRoutePathResolver,
  type AppRouteTreeNode,
} from "@/config/app.config.types";
import { AppRouteRedirect } from "@/sitemap/AppRouteRedirect";
import { getRouteNodeKey, isAppPageConfig } from "@/sitemap/routeMetadata";
import { type AppRouteRegistry } from "@/sitemap/routePath.types";
import {
  assertLocalRoutePath,
  getRequiredParamNames,
  joinRoutePattern,
  stringifyPathParams,
} from "@/sitemap/routePath.utils";
import React from "react";
import { generatePath } from "react-router";

function createRouteHandle(node: AppRouteNodeConfig) {
  return {
    breadcrumb: (t, params: AppRouteParams) => node.label(t, params),
    permission: node.permission,
  } satisfies NonNullable<AppRouteObject["handle"]>;
}

export function createPageRoute(page: AppPageConfig): AppRouteObject {
  return {
    path: page.routePath,
    Component: page.Component,
    handle: createRouteHandle(page),
  };
}

function createRedirectRoute(toPattern: string): AppRouteObject {
  return {
    path: "",
    element: React.createElement(AppRouteRedirect, { toPattern }),
  };
}

type RouteBuildContext = {
  pagePatterns: Map<string, string>;
  routePatterns: Map<string, string>;
};

function registerRoutePattern(context: RouteBuildContext, pattern: string, key: string): void {
  const duplicateKey = context.routePatterns.get(pattern);

  if (duplicateKey && duplicateKey !== key) {
    throw new Error(`Duplicate route pattern "${pattern}" for route nodes "${duplicateKey}" and "${key}".`);
  }

  context.routePatterns.set(pattern, key);
}

function registerPagePattern(context: RouteBuildContext, key: string, pattern: string): void {
  if (context.pagePatterns.has(key)) {
    throw new Error(`Page "${key}" is mounted more than once. Use a distinct page definition for each route mount.`);
  }

  context.pagePatterns.set(key, pattern);
}

function isRouteNodeConfig(node: AppRouteTreeNode): node is AppPageConfig {
  return APP_ROUTE_NODE_KIND in node;
}

function collectRoutePatterns(
  nodes: readonly AppRouteTreeNode[],
  parentPattern: string,
  context: RouteBuildContext,
): void {
  nodes.forEach(node => {
    if (isRouteNodeConfig(node)) {
      const key = getRouteNodeKey(node);
      assertLocalRoutePath(node.routePath, key);

      const pattern = joinRoutePattern(parentPattern, node.routePath);
      registerRoutePattern(context, pattern, key);
      registerPagePattern(context, key, pattern);
      return;
    }

    const key = getRouteNodeKey(node.node);
    assertLocalRoutePath(node.node.routePath, key);

    const pattern = joinRoutePattern(parentPattern, node.node.routePath);
    registerRoutePattern(context, pattern, key);

    if (isAppPageConfig(node.node)) {
      registerPagePattern(context, key, pattern);
    }

    if (node.children) {
      collectRoutePatterns(node.children, pattern, context);
    }
  });
}

function createRoutes(nodes: readonly AppRouteTreeNode[], context: RouteBuildContext): AppRouteObject[] {
  return nodes.map(node => {
    if (isRouteNodeConfig(node)) {
      return createPageRoute(node);
    }

    const children = node.children ? createRoutes(node.children, context) : [];
    const redirectPattern = node.redirectTo ? context.pagePatterns.get(getRouteNodeKey(node.redirectTo)) : undefined;

    if (node.redirectTo && !redirectPattern) {
      throw new Error(`Missing route target for redirectTo "${getRouteNodeKey(node.redirectTo)}".`);
    }

    return {
      path: node.node.routePath,
      ...(isAppPageConfig(node.node) ? { Component: node.node.Component } : {}),
      handle: createRouteHandle(node.node),
      children: [...(redirectPattern ? [createRedirectRoute(redirectPattern)] : []), ...children],
    };
  });
}

export function defineRoutes<const TRoutes extends readonly AppRouteTreeNode[]>(
  nodes: TRoutes,
): AppRouteRegistry<TRoutes> {
  const context: RouteBuildContext = {
    pagePatterns: new Map<string, string>(),
    routePatterns: new Map<string, string>(),
  };

  collectRoutePatterns(nodes, "", context);

  const registry: AppRoutePathResolver = {
    getPath(page, params) {
      const pattern = registry.getPathPattern(page);
      const requiredParams = getRequiredParamNames(pattern);
      const missingParams = requiredParams.filter(param => params?.[param] == null);

      if (missingParams.length > 0) {
        throw new Error(
          `Missing route params for "${getRouteNodeKey(page)}": ${missingParams.map(param => `"${param}"`).join(", ")}.`,
        );
      }

      return generatePath(pattern, stringifyPathParams(params));
    },

    getPathPattern(page) {
      const pattern = context.pagePatterns.get(getRouteNodeKey(page));

      if (!pattern) {
        throw new Error(`Page "${getRouteNodeKey(page)}" is not mounted in the route tree.`);
      }

      return pattern;
    },
  };

  return {
    routes: createRoutes(nodes, context),
    getPath: registry.getPath,
    getPathPattern: registry.getPathPattern,
  } as AppRouteRegistry<TRoutes>;
}
