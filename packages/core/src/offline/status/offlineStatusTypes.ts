export type OfflineStatusSnapshot = {
  online: boolean;
  heartbeatEnabled: boolean;
  heartbeatConnected: boolean;
  syncInProgress: boolean;
  lastHeartbeatAt: number | null;
};

export type OfflineStatusRuntimeOptions = {
  staleAfterMs?: number;
  bootstrapAssumeOnlineMs?: number;
  tickMs?: number;
  now?: () => number;
};

export type OfflineStatusRuntime = {
  start: () => () => void;
  getSnapshot: () => OfflineStatusSnapshot;
  setHeartbeatEnabled: (enabled: boolean) => void;
  markHeartbeatConnected: () => void;
  markHeartbeatDisconnected: () => void;
  markHeartbeatReceived: (syncInProgress: boolean) => void;
  markBackendUnavailable: () => void;
  markBackendAvailable: () => void;
};