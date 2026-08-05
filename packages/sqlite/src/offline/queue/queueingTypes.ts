export type OfflineSyncCommand = {
  commandId: string;
  method: string;
  url: string;
  body: unknown | null;
  headers: Record<string, string>;
  createdAt: number;
};

export type QueueableRequest = {
  method?: string;
  url: string;
};

export type QueueingPolicyOptions = {
  includeMethods?: string[];
  apiPrefix?: string;
  excludedPrefixes?: string[];
  excludeSearchPosts?: boolean;
};
