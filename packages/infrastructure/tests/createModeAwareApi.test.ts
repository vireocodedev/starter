import { createModeAwareApi, transactional, type ModeAwareApiInvocationEvent } from "@/index";
import { describe, expect, it, vi } from "vitest";

class OfflineFallbackError extends Error {}

describe("createModeAwareApi", () => {
  it("discovers inherited methods and preserves their module receiver", async () => {
    class BaseApi {
      constructor(private readonly prefix: string) {}
      async find(value: string) {
        return `${this.prefix}:${value}`;
      }
    }

    class ExampleApi extends BaseApi {}
    const api = createModeAwareApi({
      onlineApi: { Example: new ExampleApi("online") },
      offlineApi: { Example: new ExampleApi("offline") },
      readOnline: () => true,
    });

    await expect(api.Example.find("value")).resolves.toBe("online:value");
  });

  it("selects implementations from current connectivity and reports timing", async () => {
    let online = true;
    const onlineFind = vi.fn(async () => "online");
    const offlineFind = vi.fn(async () => "offline");
    const successes: ModeAwareApiInvocationEvent[] = [];
    const times = [10, 15, 20, 28];
    const api = createModeAwareApi({
      onlineApi: { Example: { find: onlineFind } },
      offlineApi: { Example: { find: offlineFind } },
      readOnline: () => online,
      now: () => times.shift() ?? 0,
      onInvokeSuccess: event => successes.push(event),
    });

    await expect(api.Example.find()).resolves.toBe("online");
    online = false;
    await expect(api.Example.find()).resolves.toBe("offline");
    expect(successes).toMatchObject([
      { methodLabel: "Example.find", online: true, mode: "online", durationMs: 5 },
      { methodLabel: "Example.find", online: false, mode: "offline", durationMs: 8 },
    ]);
  });

  it("routes transactional methods online when possible and offline otherwise", async () => {
    class OnlineApi {
      async save(value: string) {
        return `online:${value}`;
      }
    }
    class OfflineApi {
      @transactional()
      async save(value: string) {
        return `offline:${value}`;
      }
    }

    let online = true;
    const api = createModeAwareApi({
      onlineApi: { Example: new OnlineApi() },
      offlineApi: { Example: new OfflineApi() },
      readOnline: () => online,
    });

    await expect(api.Example.save("first")).resolves.toBe("online:first");
    online = false;
    await expect(api.Example.save("second")).resolves.toBe("offline:second");
  });

  it("falls through expected offline limitations to an online implementation", async () => {
    const onInvokeError = vi.fn();
    const offlineFind = vi.fn(async () => {
      throw new OfflineFallbackError("not cached");
    });
    const onlineFind = vi.fn(async () => "remote");
    const api = createModeAwareApi({
      onlineApi: { Example: { find: onlineFind } },
      offlineApi: { Example: { find: offlineFind } },
      readOnline: () => false,
      isOfflineFallbackError: error => error instanceof OfflineFallbackError,
      onInvokeError,
    });

    await expect(api.Example.find()).resolves.toBe("remote");
    expect(offlineFind).toHaveBeenCalledBefore(onlineFind);
    expect(onInvokeError).not.toHaveBeenCalled();
  });

  it("does not fall back after ordinary online or offline failures", async () => {
    const onlineError = new Error("remote failed");
    const offlineError = new Error("local failed");
    const offlineFind = vi.fn(async () => {
      throw offlineError;
    });
    const onlineFind = vi.fn(async () => {
      throw onlineError;
    });
    const onInvokeError = vi.fn();
    let online = true;
    const api = createModeAwareApi({
      onlineApi: { Example: { find: onlineFind } },
      offlineApi: { Example: { find: offlineFind } },
      readOnline: () => online,
      onInvokeError,
    });

    await expect(api.Example.find()).rejects.toBe(onlineError);
    online = false;
    await expect(api.Example.find()).rejects.toBe(offlineError);
    expect(onInvokeError.mock.calls.map(([event]) => event.mode)).toEqual(["online", "offline"]);
  });

  it("runs caller policy before selecting a handler", async () => {
    const policyError = new Error("blocked by application policy");
    const find = vi.fn(async () => "unreachable");
    const api = createModeAwareApi({
      onlineApi: { Example: { find } },
      offlineApi: { Example: { find } },
      readOnline: () => false,
      assertCanInvoke: () => {
        throw policyError;
      },
    });

    await expect(api.Example.find()).rejects.toBe(policyError);
    expect(find).not.toHaveBeenCalled();
  });

  it("uses the configured terminal error when no fallback exists", async () => {
    const noFallbackError = new Error("no handler remains");
    const onlineApi = { Example: { onlineOnly: async () => "online" } };
    const offlineApi = {
      Example: {
        offlineOnly: async () => {
          throw new OfflineFallbackError("unsupported");
        },
      },
    };
    const api = createModeAwareApi({
      onlineApi,
      offlineApi,
      readOnline: () => false,
      isOfflineFallbackError: error => error instanceof OfflineFallbackError,
      createNoFallbackError: () => noFallbackError,
    });

    const offlineOnly = (api.Example as typeof onlineApi.Example & typeof offlineApi.Example).offlineOnly;
    await expect(offlineOnly()).rejects.toBe(noFallbackError);
  });

  it("rejects registry modules without callable handlers", () => {
    expect(() =>
      createModeAwareApi({
        onlineApi: { Empty: { value: true } },
        offlineApi: { Empty: { value: false } },
        readOnline: () => true,
      }),
    ).toThrow("[api] Module Empty has no callable handlers");
  });
});
