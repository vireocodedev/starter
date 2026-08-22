import { createConnectivityState, type ConnectivityRuntimeAdapter } from "@vireocodedev/starter-infrastructure";

export function runConnectivityExample() {
  let now = 0;
  let browserListener: ((online: boolean) => void) | undefined;
  let heartbeatAgeCheck: (() => void) | undefined;
  const runtime: ConnectivityRuntimeAdapter = {
    readBrowserOnline: () => true,
    subscribeBrowserOnline: listener => {
      browserListener = listener;
      return () => undefined;
    },
    scheduleRepeating: callback => {
      heartbeatAgeCheck = callback;
      return () => undefined;
    },
  };
  const connectivity = createConnectivityState({
    initialBrowserOnline: true,
    heartbeatStaleAfterMs: 5_000,
    heartbeatBootstrapAssumeOnlineMs: 1_000,
    now: () => now,
  });
  const stop = connectivity.startRuntime(runtime);
  connectivity.setHeartbeatEnabled(true);
  connectivity.markHeartbeatReceived(false);
  const connected = connectivity.sigSnapshot.value;

  now = 5_001;
  heartbeatAgeCheck?.();
  const stale = connectivity.sigSnapshot.value;
  browserListener?.(false);
  const browserOffline = connectivity.sigSnapshot.value;
  stop();

  return { connected, stale, browserOffline };
}
