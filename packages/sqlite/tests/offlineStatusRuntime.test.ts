// @vitest-environment jsdom

import { createOfflineStatusRuntime } from "@/offline/status/offlineStatusRuntime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `createOfflineStatusRuntime` decides whether the app believes it is online,
 * which gates the entire offline/SQLite experience. It is a pure factory with
 * an injectable clock, so the staleness and bootstrap windows can be pinned
 * exactly rather than waited out.
 */

const STALE_AFTER_MS = 15_000;
const BOOTSTRAP_MS = 6_000;

let currentTime = 0;

function createRuntime(overrides: Parameters<typeof createOfflineStatusRuntime>[0] = {}) {
  return createOfflineStatusRuntime({
    staleAfterMs: STALE_AFTER_MS,
    bootstrapAssumeOnlineMs: BOOTSTRAP_MS,
    tickMs: 1_000,
    now: () => currentTime,
    ...overrides,
  });
}

beforeEach(() => {
  currentTime = 1_000_000;
});

describe("createOfflineStatusRuntime", () => {
  describe("without a heartbeat", () => {
    it("reports online while the browser is online", () => {
      expect(createRuntime().getSnapshot()).toMatchObject({
        online: true,
        heartbeatEnabled: false,
        heartbeatConnected: false,
        syncInProgress: false,
        lastHeartbeatAt: null,
      });
    });

    it("reports offline once the backend is marked unavailable", () => {
      const runtime = createRuntime();

      runtime.markBackendUnavailable();
      expect(runtime.getSnapshot().online).toBe(false);

      runtime.markBackendAvailable();
      expect(runtime.getSnapshot().online).toBe(true);
    });
  });

  describe("heartbeat bootstrap window", () => {
    it("assumes online until the first heartbeat is due", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);

      currentTime += BOOTSTRAP_MS;
      expect(runtime.getSnapshot().online).toBe(true);
    });

    it("falls back to offline when no heartbeat arrives within the window", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);

      currentTime += BOOTSTRAP_MS + 1;
      expect(runtime.getSnapshot().online).toBe(false);
    });
  });

  describe("heartbeat staleness", () => {
    it("stays online while heartbeats are fresh", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);
      runtime.markHeartbeatReceived(false);

      currentTime += STALE_AFTER_MS;
      expect(runtime.getSnapshot().online).toBe(true);
    });

    it("goes offline once the last heartbeat is stale", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);
      runtime.markHeartbeatReceived(false);

      currentTime += STALE_AFTER_MS + 1;
      expect(runtime.getSnapshot().online).toBe(false);
    });

    it("recovers when a fresh heartbeat arrives after going stale", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);
      runtime.markHeartbeatReceived(false);

      currentTime += STALE_AFTER_MS + 1;
      expect(runtime.getSnapshot().online).toBe(false);

      runtime.markHeartbeatReceived(false);
      expect(runtime.getSnapshot().online).toBe(true);
    });

    it("surfaces the sync flag carried by the heartbeat", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);

      runtime.markHeartbeatReceived(true);
      expect(runtime.getSnapshot().syncInProgress).toBe(true);

      runtime.markHeartbeatReceived(false);
      expect(runtime.getSnapshot().syncInProgress).toBe(false);
    });
  });

  describe("setHeartbeatEnabled", () => {
    it("clears heartbeat state when disabled", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);
      runtime.markHeartbeatReceived(true);

      runtime.setHeartbeatEnabled(false);

      expect(runtime.getSnapshot()).toMatchObject({
        online: true,
        heartbeatEnabled: false,
        heartbeatConnected: false,
        syncInProgress: false,
        lastHeartbeatAt: null,
      });
    });

    it("ignores a redundant enable so the bootstrap window is not extended", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);

      currentTime += BOOTSTRAP_MS;
      runtime.setHeartbeatEnabled(true);

      currentTime += 1;
      expect(runtime.getSnapshot().online).toBe(false);
    });

    it("clears a backend-unavailable override when toggled", () => {
      const runtime = createRuntime();
      runtime.markBackendUnavailable();
      expect(runtime.getSnapshot().online).toBe(false);

      runtime.setHeartbeatEnabled(true);
      expect(runtime.getSnapshot().online).toBe(true);
    });
  });

  describe("markHeartbeatDisconnected", () => {
    it("clears the connected flag once connected", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);
      runtime.markHeartbeatConnected();
      expect(runtime.getSnapshot().heartbeatConnected).toBe(true);

      runtime.markHeartbeatDisconnected();
      expect(runtime.getSnapshot().heartbeatConnected).toBe(false);
    });

    it("is a no-op when never connected", () => {
      const runtime = createRuntime();
      runtime.setHeartbeatEnabled(true);

      runtime.markHeartbeatDisconnected();
      expect(runtime.getSnapshot().heartbeatConnected).toBe(false);
    });
  });

  describe("start", () => {
    afterEach(() => {
      vi.useRealTimers();
      window.dispatchEvent(new Event("online"));
    });

    it("tracks browser online/offline events and detaches on cleanup", () => {
      const runtime = createRuntime();
      const stop = runtime.start();

      window.dispatchEvent(new Event("offline"));
      expect(runtime.getSnapshot().online).toBe(false);

      window.dispatchEvent(new Event("online"));
      expect(runtime.getSnapshot().online).toBe(true);

      stop();
      window.dispatchEvent(new Event("offline"));
      expect(runtime.getSnapshot().online).toBe(true);
    });

    it("drops the connected flag on the tick that detects a stale heartbeat", () => {
      vi.useFakeTimers();

      const runtime = createRuntime();
      const stop = runtime.start();
      runtime.setHeartbeatEnabled(true);
      runtime.markHeartbeatReceived(false);

      currentTime += STALE_AFTER_MS + 1;
      vi.advanceTimersByTime(1_000);

      expect(runtime.getSnapshot().heartbeatConnected).toBe(false);
      stop();
    });
  });
});
