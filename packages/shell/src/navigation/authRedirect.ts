export type ShellLocationSnapshot = { pathname: string; search?: string; hash?: string };
export type ShellAuthRedirectState = { from: string };

export function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
  try {
    return new URL(path, "https://starter.invalid").origin === "https://starter.invalid";
  } catch {
    return false;
  }
}

export function createAuthRedirectState(
  location: ShellLocationSnapshot,
  loginPath: string,
): ShellAuthRedirectState | undefined {
  const returnPath = `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;
  if (location.pathname === loginPath || !isSafeInternalPath(returnPath)) return undefined;
  return { from: returnPath };
}

export function resolvePostLoginPath(state: unknown, fallbackPath: string): string {
  if (typeof state !== "object" || state == null || !("from" in state)) return fallbackPath;
  const from = (state as { from?: unknown }).from;
  return typeof from === "string" && isSafeInternalPath(from) ? from : fallbackPath;
}
