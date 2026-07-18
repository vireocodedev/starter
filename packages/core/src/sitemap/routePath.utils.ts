import { type AppRoutePathParams } from "@/config/app.config.types";

export function normalizeRoutePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

export function assertLocalRoutePath(routePath: string, key: string): void {
  if (routePath.startsWith("/")) {
    throw new Error(`Route node "${key}" must use a local routePath segment, but received "${routePath}".`);
  }
}

export function joinRoutePattern(parentPath: string, routePath: string): string {
  const parent = normalizeRoutePath(parentPath);
  const child = normalizeRoutePath(routePath);

  if (!parent && !child) {
    return "/";
  }

  return `/${[parent, child].filter(Boolean).join("/")}`;
}

export function getRequiredParamNames(pattern: string): string[] {
  return Array.from(pattern.matchAll(/:([^/?*]+)/g), match => match[1]);
}

export function stringifyPathParams(params: AppRoutePathParams | undefined): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params ?? {}).flatMap(([key, value]) => (value == null ? [] : [[key, String(value)]])),
  );
}
