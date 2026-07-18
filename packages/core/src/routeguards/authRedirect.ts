import { type Location } from "react-router";

export type AppAuthRedirectState = {
  from: string;
};

function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return false;
  }

  try {
    const resolvedUrl = new URL(path, window.location.origin);
    return resolvedUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function createAuthRedirectState(
  location: Pick<Location, "hash" | "pathname" | "search">,
  loginPath: string,
): AppAuthRedirectState | undefined {
  const returnPath = `${location.pathname}${location.search}${location.hash}`;

  if (location.pathname === loginPath || !isSafeInternalPath(returnPath)) {
    return undefined;
  }

  return { from: returnPath };
}

export function resolvePostLoginPath(state: unknown, fallbackPath: string): string {
  if (typeof state !== "object" || state == null || !("from" in state)) {
    return fallbackPath;
  }

  const from = (state as { from?: unknown }).from;
  return typeof from === "string" && isSafeInternalPath(from) ? from : fallbackPath;
}
