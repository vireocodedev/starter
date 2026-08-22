import type { ShellRouteParams } from "./shellSitemap.types";

export function normalizeRoutePath(path: string): string {
  return path.replace(/^\/+|\/+$/gu, "");
}

export function joinRoutePattern(parentPath: string, routePath: string): string {
  const parent = normalizeRoutePath(parentPath);
  const child = normalizeRoutePath(routePath);

  if (!parent && !child) return "/";
  return `/${[parent, child].filter(Boolean).join("/")}`;
}

export function getRequiredRouteParamNames(pattern: string): string[] {
  return Array.from(pattern.matchAll(/:([^/?*]+)([?*]?)/gu))
    .filter(match => match[2] === "")
    .map(match => match[1]);
}

function encodeRouteValue(value: string | number, preserveSlashes: boolean): string {
  const text = String(value);
  return preserveSlashes ? text.split("/").map(encodeURIComponent).join("/") : encodeURIComponent(text);
}

export function generateShellPath(pattern: string, params: ShellRouteParams = {}): string {
  const segments = pattern.split("/");
  const generated = segments.flatMap(segment => {
    const match = segment.match(/^:([^?*]+)([?*]?)$/u);
    if (!match) return [segment];

    const [, name, modifier] = match;
    const value = params[name];
    if (value == null) {
      if (modifier === "?" || modifier === "*") return [];
      throw new Error(`Missing required route parameter "${name}" for pattern "${pattern}".`);
    }

    return [encodeRouteValue(value, modifier === "*")];
  });

  return generated.join("/") || "/";
}
