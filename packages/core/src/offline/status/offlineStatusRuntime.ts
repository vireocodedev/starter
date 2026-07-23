import {
  type OfflineStatusRuntime,
  type OfflineStatusRuntimeOptions,
  type OfflineStatusSnapshot,
} from "@/offline/status/offlineStatusTypes";

type OfflineStatusState = {
  browserOnline: boolean;
  heartbeatEnabled: boolean;
  heartbeatEnabledAt: number | null;
  backendReachableOverride: boolean | null;
  heartbeatConnected: boolean;
  syncInProgress: boolean;
  lastHeartbeatAt: number | null;
};

export function createOfflineStatusRuntime(options?: OfflineStatusRuntimeOptions): OfflineStatusRuntime {
  const staleAfterMs = options?.staleAfterMs ?? 15_000;
  const bootstrapAssumeOnlineMs = options?.bootstrapAssumeOnlineMs ?? 6_000;
  const tickMs = options?.tickMs ?? 1_000;
  const now = options?.now ?? (() => Date.now());

  const state: OfflineStatusState = {
    browserOnline: typeof navigator === "undefined" ? true : navigator.onLine,
    heartbeatEnabled: false,
    heartbeatEnabledAt: null,
    backendReachableOverride: null,
    heartbeatConnected: false,
    syncInProgress: false,
    lastHeartbeatAt: null,
  };

  const computeOnline = (): boolean => {
    if (state.backendReachableOverride === false) {
      return false;
    }

    if (!state.browserOnline) {
      return false;
    }

    if (!state.heartbeatEnabled) {
      return true;
    }

    if (state.lastHeartbeatAt == null) {
      if (state.heartbeatEnabledAt == null) {
        return false;
      }

      return now() - state.heartbeatEnabledAt <= bootstrapAssumeOnlineMs;
    }

    return now() - state.lastHeartbeatAt <= staleAfterMs;
  };

  const getSnapshot = (): OfflineStatusSnapshot => {
    return {
      online: computeOnline(),
      heartbeatEnabled: state.heartbeatEnabled,
      heartbeatConnected: state.heartbeatConnected,
      syncInProgress: state.syncInProgress,
      lastHeartbeatAt: state.lastHeartbeatAt,
    };
  };

  const setHeartbeatEnabled = (enabled: boolean): void => {
    if (state.heartbeatEnabled === enabled) {
      return;
    }

    state.heartbeatEnabled = enabled;
    state.heartbeatEnabledAt = enabled ? now() : null;
    state.backendReachableOverride = null;

    if (!enabled) {
      state.heartbeatConnected = false;
      state.lastHeartbeatAt = null;
      state.syncInProgress = false;
    }
  };

  const markHeartbeatConnected = (): void => {
    state.backendReachableOverride = true;
    state.heartbeatConnected = true;
    state.lastHeartbeatAt = now();
  };

  const markHeartbeatDisconnected = (): void => {
    if (!state.heartbeatConnected) {
      return;
    }

    state.heartbeatConnected = false;
  };

  const markHeartbeatReceived = (syncInProgress: boolean): void => {
    state.backendReachableOverride = true;
    state.heartbeatConnected = true;
    state.lastHeartbeatAt = now();
    state.syncInProgress = syncInProgress;
  };

  const markBackendUnavailable = (): void => {
    state.backendReachableOverride = false;
  };

  const markBackendAvailable = (): void => {
    state.backendReachableOverride = true;
  };

  const start = (): (() => void) => {
    if (typeof window === "undefined") {
      return () => undefined;
    }

    const onBrowserOnline = (): void => {
      state.browserOnline = true;
    };

    const onBrowserOffline = (): void => {
      state.browserOnline = false;
    };

    window.addEventListener("online", onBrowserOnline);
    window.addEventListener("offline", onBrowserOffline);

    const intervalId = window.setInterval(() => {
      if (!state.heartbeatEnabled || state.lastHeartbeatAt == null) {
        return;
      }

      if (now() - state.lastHeartbeatAt > staleAfterMs) {
        markHeartbeatDisconnected();
      }
    }, tickMs);

    return () => {
      window.removeEventListener("online", onBrowserOnline);
      window.removeEventListener("offline", onBrowserOffline);
      window.clearInterval(intervalId);
    };
  };

  return {
    start,
    getSnapshot,
    setHeartbeatEnabled,
    markHeartbeatConnected,
    markHeartbeatDisconnected,
    markHeartbeatReceived,
    markBackendUnavailable,
    markBackendAvailable,
  };
}