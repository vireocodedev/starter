import { type QueueableRequest, type QueueingPolicyOptions } from "@/offline/queue/queueingTypes";

const DEFAULT_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isOfflineQueueableRequest(request: QueueableRequest, options?: QueueingPolicyOptions): boolean {
  const methods = new Set((options?.includeMethods ?? [...DEFAULT_METHODS]).map(method => method.toUpperCase()));
  const method = (request.method ?? "GET").toUpperCase();

  if (!methods.has(method)) {
    return false;
  }

  const apiPrefix = options?.apiPrefix ?? "/api/";
  if (!request.url.startsWith(apiPrefix)) {
    return false;
  }

  const excludedPrefixes = options?.excludedPrefixes ?? ["/api/auth", "/api/offline/"];
  if (excludedPrefixes.some(prefix => request.url.startsWith(prefix))) {
    return false;
  }

  if ((options?.excludeSearchPosts ?? true) && method === "POST") {
    const pathname = request.url.split("?")[0];
    if (pathname.endsWith("/search")) {
      return false;
    }
  }

  return true;
}
