import { createConnectivityState, type ConnectivityRuntimeAdapter } from "@/index";
import { describe, expect, it, vi } from "vitest";

function createHarness(initialBrowserOnline = true) {
  let currentTime = 0;
  let browserOnline = initialBrowserOnline;
  let browserListener: ((online: boolean) => void) | undefined;
  let intervalCallback: (() => void) | undefined;
  const unsubscribe = vi.fn();
  const stopInterval = vi.fn();
  const runtime: ConnectivityRuntimeAdapter = {
    readBrowserOnline: () => browserOnline,
    subscribeBrowserOnline: listener => {
      browserListener = listener;
      return unsubscribe;
    },
    scheduleRepeating: callback => {
      intervalCallback = callback;
      return stopInterval;
    },
  };
  const state = createConnectivityState({
    initialBrowserOnline,
    heartbeatStaleAfterMs: 5_000,
    heartbeatBootstrapAssumeOnlineMs: 2_000,
    now: () => currentTime,
  });

  return {
    state,
    runtime,
    advanceBy(milliseconds: number) {
      currentTime += milliseconds;
      intervalCallback?.();
    },
    setBrowserOnline(online: boolean) {
      browserOnline = online;
      browserListener?.(online);
    },
    unsubscribe,
    stopInterval,
  };
}

describe("createConnectivityState", () => {
  it("tracks browser connectivity through the injected runtime", () => {
    const harness = createHarness();
    const stop = harness.state.startRuntime(harness.runtime);
    expect(harness.state.sigOnline.value).toBe(true);
    harness.setBrowserOnline(false);
    expect(harness.state.sigOnline.value).toBe(false);
    harness.setBrowserOnline(true);
    expect(harness.state.sigOnline.value).toBe(true);
    stop();
    expect(harness.unsubscribe).toHaveBeenCalledOnce();
    expect(harness.stopInterval).toHaveBeenCalledOnce();
  });

  it("expires bootstrap state and requests deduplicated reconnects", () => {
    const harness = createHarness();
    harness.state.startRuntime(harness.runtime);
    harness.state.setHeartbeatEnabled(true);
    expect(harness.state.sigOnline.value).toBe(true);
    harness.advanceBy(2_001);
    expect(harness.state.sigOnline.value).toBe(false);
    harness.advanceBy(3_000);
    expect(harness.state.sigReconnectRequestTick.value).toBe(1);
    harness.advanceBy(5_000);
    expect(harness.state.sigReconnectRequestTick.value).toBe(1);
    harness.advanceBy(1);
    expect(harness.state.sigReconnectRequestTick.value).toBe(2);
  });

  it("records fresh heartbeats and later marks them stale", () => {
    const harness = createHarness();
    harness.state.startRuntime(harness.runtime);
    harness.state.setHeartbeatEnabled(true);
    harness.state.markHeartbeatReceived(true);
    expect(harness.state.sigSnapshot.value).toMatchObject({
      online: true,
      heartbeatConnected: true,
      syncInProgress: true,
      lastHeartbeatAt: 0,
    });
    harness.advanceBy(5_001);
    expect(harness.state.sigSnapshot.value).toMatchObject({ online: false, heartbeatConnected: false });
  });

  it("honors explicit backend availability until heartbeat policy changes", () => {
    const harness = createHarness();
    harness.state.setHeartbeatEnabled(true);
    harness.state.markBackendUnavailable();
    expect(harness.state.sigOnline.value).toBe(false);
    harness.state.markBackendAvailable();
    expect(harness.state.sigOnline.value).toBe(true);
    harness.state.setHeartbeatEnabled(false);
    expect(harness.state.sigSnapshot.value).toMatchObject({
      online: true,
      heartbeatEnabled: false,
      heartbeatConnected: false,
      syncInProgress: false,
      lastHeartbeatAt: null,
    });
  });
});
