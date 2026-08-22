import { computed, signal } from "@preact/signals-core";

export type ConnectivitySnapshot = {
  online: boolean;
  heartbeatEnabled: boolean;
  heartbeatConnected: boolean;
  syncInProgress: boolean;
  lastHeartbeatAt: number | null;
};

export type ConnectivityRuntimeAdapter = {
  readBrowserOnline: () => boolean;
  subscribeBrowserOnline: (listener: (online: boolean) => void) => () => void;
  scheduleRepeating: (callback: () => void, intervalMs: number) => () => void;
};

export type ConnectivityStateOptions = {
  initialBrowserOnline: boolean;
  heartbeatStaleAfterMs: number;
  heartbeatBootstrapAssumeOnlineMs: number;
  runtimeIntervalMs?: number;
  now?: () => number;
};

function assertFiniteDuration(name: string, value: number, allowZero: boolean): void {
  if (!Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new RangeError(`${name} must be a finite ${allowZero ? "non-negative" : "positive"} number`);
  }
}

export function createConnectivityState({
  initialBrowserOnline,
  heartbeatStaleAfterMs,
  heartbeatBootstrapAssumeOnlineMs,
  runtimeIntervalMs = 1_000,
  now = Date.now,
}: ConnectivityStateOptions) {
  assertFiniteDuration("heartbeatStaleAfterMs", heartbeatStaleAfterMs, false);
  assertFiniteDuration("heartbeatBootstrapAssumeOnlineMs", heartbeatBootstrapAssumeOnlineMs, true);
  assertFiniteDuration("runtimeIntervalMs", runtimeIntervalMs, false);

  const sigBrowserOnline = signal(initialBrowserOnline);
  const sigHeartbeatEnabled = signal(false);
  const sigHeartbeatEnabledAt = signal<number | null>(null);
  const sigBackendReachableOverride = signal<boolean | null>(null);
  const sigHeartbeatConnected = signal(false);
  const sigSyncInProgress = signal(false);
  const sigLastHeartbeatAt = signal<number | null>(null);
  const sigHeartbeatAgeTick = signal(0);
  const sigLastReconnectRequestAt = signal<number | null>(null);
  const sigReconnectRequestTick = signal(0);
  let activeRuntimeStop: (() => void) | null = null;

  const sigOnline = computed<boolean>(() => {
    void sigHeartbeatAgeTick.value;

    if (sigBackendReachableOverride.value === false || !sigBrowserOnline.value) {
      return false;
    }

    if (!sigHeartbeatEnabled.value) {
      return true;
    }

    const lastHeartbeatAt = sigLastHeartbeatAt.value;
    if (lastHeartbeatAt == null) {
      const heartbeatEnabledAt = sigHeartbeatEnabledAt.value;
      return heartbeatEnabledAt != null && now() - heartbeatEnabledAt <= heartbeatBootstrapAssumeOnlineMs;
    }

    return now() - lastHeartbeatAt <= heartbeatStaleAfterMs;
  });

  const sigSnapshot = computed<ConnectivitySnapshot>(() => ({
    online: sigOnline.value,
    heartbeatEnabled: sigHeartbeatEnabled.value,
    heartbeatConnected: sigHeartbeatConnected.value,
    syncInProgress: sigSyncInProgress.value,
    lastHeartbeatAt: sigLastHeartbeatAt.value,
  }));

  function requestReconnect(): void {
    sigReconnectRequestTick.value += 1;
    sigLastReconnectRequestAt.value = now();
  }

  function setHeartbeatEnabled(enabled: boolean): void {
    if (sigHeartbeatEnabled.value === enabled) {
      return;
    }

    sigHeartbeatEnabled.value = enabled;
    sigHeartbeatEnabledAt.value = enabled ? now() : null;
    sigBackendReachableOverride.value = null;

    if (!enabled) {
      sigHeartbeatConnected.value = false;
      sigLastHeartbeatAt.value = null;
      sigSyncInProgress.value = false;
      sigLastReconnectRequestAt.value = null;
    }
  }

  function markHeartbeatConnected(): void {
    sigBackendReachableOverride.value = true;
    sigHeartbeatConnected.value = true;
    sigLastHeartbeatAt.value = now();
    sigLastReconnectRequestAt.value = null;
  }

  function markHeartbeatDisconnected(): void {
    sigHeartbeatConnected.value = false;
  }

  function markHeartbeatReceived(syncInProgress: boolean): void {
    sigBackendReachableOverride.value = true;
    sigHeartbeatConnected.value = true;
    sigLastHeartbeatAt.value = now();
    sigSyncInProgress.value = syncInProgress;
    sigLastReconnectRequestAt.value = null;
  }

  function markBackendUnavailable(): void {
    sigBackendReachableOverride.value = false;
  }

  function markBackendAvailable(): void {
    sigBackendReachableOverride.value = true;
  }

  function refreshHeartbeatAge(): void {
    if (!sigHeartbeatEnabled.value) {
      return;
    }

    sigHeartbeatAgeTick.value += 1;
    const currentTime = now();
    const lastHeartbeatAt = sigLastHeartbeatAt.value;
    const heartbeatEnabledAt = sigHeartbeatEnabledAt.value;
    const heartbeatAge = lastHeartbeatAt == null ? null : currentTime - lastHeartbeatAt;
    const enabledAge = heartbeatEnabledAt == null ? null : currentTime - heartbeatEnabledAt;
    const heartbeatIsStale =
      heartbeatAge == null
        ? enabledAge != null && enabledAge > heartbeatStaleAfterMs
        : heartbeatAge > heartbeatStaleAfterMs;

    if (!heartbeatIsStale) {
      return;
    }

    markHeartbeatDisconnected();
    const lastReconnectRequestAt = sigLastReconnectRequestAt.value;
    if (lastReconnectRequestAt == null || currentTime - lastReconnectRequestAt > heartbeatStaleAfterMs) {
      requestReconnect();
    }
  }

  function startRuntime(adapter: ConnectivityRuntimeAdapter): () => void {
    if (activeRuntimeStop) {
      throw new Error("Connectivity runtime has already been started");
    }

    sigBrowserOnline.value = adapter.readBrowserOnline();
    const unsubscribeBrowserOnline = adapter.subscribeBrowserOnline(online => {
      sigBrowserOnline.value = online;
    });
    let stopHeartbeatAgeChecks: () => void;
    try {
      stopHeartbeatAgeChecks = adapter.scheduleRepeating(refreshHeartbeatAge, runtimeIntervalMs);
    } catch (error) {
      unsubscribeBrowserOnline();
      throw error;
    }

    const stop = () => {
      if (activeRuntimeStop !== stop) {
        return;
      }

      activeRuntimeStop = null;
      unsubscribeBrowserOnline();
      stopHeartbeatAgeChecks();
    };
    activeRuntimeStop = stop;
    return stop;
  }

  return {
    sigOnline,
    sigSnapshot,
    sigReconnectRequestTick,
    setHeartbeatEnabled,
    markHeartbeatConnected,
    markHeartbeatDisconnected,
    markHeartbeatReceived,
    markBackendUnavailable,
    markBackendAvailable,
    startRuntime,
  };
}
