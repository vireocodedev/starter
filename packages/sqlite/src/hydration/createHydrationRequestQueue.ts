export type HydrationRequest = {
  keys: Set<string>;
  resolve: () => void;
  reject: (error: Error) => void;
};

export type HydrationRequestBatch = {
  requests: HydrationRequest[];
  forcedKeys: Set<string>;
};

export type HydrationRequestQueue = {
  request: (keys: string[]) => Promise<void>;
  consume: () => HydrationRequestBatch;
  hasPending: () => boolean;
  rejectPending: (reason: string) => void;
  settle: (batch: HydrationRequestBatch, failedKeys: ReadonlySet<string>) => void;
  reject: (batch: HydrationRequestBatch, error: unknown) => void;
};

export type CreateHydrationRequestQueueConfig = {
  onRequestQueued?: () => void;
  createUnexpectedError?: () => Error;
};

export function createHydrationRequestQueue(config: CreateHydrationRequestQueueConfig = {}): HydrationRequestQueue {
  const pendingRequests: HydrationRequest[] = [];

  return {
    request(keys) {
      const normalizedKeys = new Set(keys.map(key => key.trim()).filter(Boolean));
      if (normalizedKeys.size === 0) return Promise.resolve();

      const promise = new Promise<void>((resolve, reject) => {
        pendingRequests.push({ keys: normalizedKeys, resolve, reject });
      });
      config.onRequestQueued?.();
      return promise;
    },
    consume() {
      const requests = pendingRequests.splice(0);
      return { requests, forcedKeys: new Set(requests.flatMap(request => [...request.keys])) };
    },
    hasPending: () => pendingRequests.length > 0,
    rejectPending(reason) {
      const error = new Error(reason);
      for (const request of pendingRequests.splice(0)) request.reject(error);
    },
    settle(batch, failedKeys) {
      for (const request of batch.requests) {
        const failedRequestedKeys = [...request.keys].filter(key => failedKeys.has(key));
        if (failedRequestedKeys.length === 0) request.resolve();
        else request.reject(new Error(`Hydration failed for: ${failedRequestedKeys.join(", ")}.`));
      }
    },
    reject(batch, error) {
      const requestError =
        error instanceof Error
          ? error
          : (config.createUnexpectedError?.() ?? new Error("Hydration failed unexpectedly."));
      for (const request of batch.requests) request.reject(requestError);
    },
  };
}
