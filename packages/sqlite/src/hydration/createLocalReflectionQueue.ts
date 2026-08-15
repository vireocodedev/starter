export type LocalReflectionQueue = {
  enqueue: (entityKey: string, operation: () => Promise<void>) => void;
  awaitIdle: () => Promise<void>;
  getPendingCount: () => number;
};

export type CreateLocalReflectionQueueConfig = {
  runEntityExclusive: (entityKey: string, operation: () => Promise<void>) => Promise<void>;
  onError?: (entityKey: string, error: unknown) => void;
  onPendingCountChange?: (pendingCount: number) => void;
};

export function createLocalReflectionQueue(config: CreateLocalReflectionQueueConfig): LocalReflectionQueue {
  const pending = new Set<Promise<void>>();
  const publishCount = () => config.onPendingCountChange?.(pending.size);

  return {
    enqueue(entityKey, operation) {
      const reflection = config.runEntityExclusive(entityKey, operation);
      pending.add(reflection);
      publishCount();
      void reflection
        .catch(error => config.onError?.(entityKey, error))
        .finally(() => {
          pending.delete(reflection);
          publishCount();
        });
    },
    async awaitIdle() {
      while (pending.size > 0) await Promise.allSettled([...pending]);
    },
    getPendingCount: () => pending.size,
  };
}
