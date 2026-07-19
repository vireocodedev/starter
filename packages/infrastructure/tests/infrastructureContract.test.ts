import {
  AppOfflineError,
  createPersistentSignal,
  findFirstTruthy,
  formatDate,
  formatDateUpsert,
  getAppOnlineStatus,
  isAppOfflineError,
  isRequestCanceled,
  sanitizeAxiosError,
} from "@/index";
import { CanceledError } from "axios";
import { describe, expect, it } from "vitest";

describe("infrastructure contract", () => {
  it("detects offline errors", () => {
    const error = new AppOfflineError();
    expect(isAppOfflineError(error)).toBe(true);
    expect(isAppOfflineError(new Error("nope"))).toBe(false);
    expect(typeof getAppOnlineStatus()).toMatch(/boolean|undefined/);
  });

  it("detects canceled requests", () => {
    expect(isRequestCanceled(new CanceledError("aborted"))).toBe(true);
    expect(isRequestCanceled(new Error("boom"))).toBe(false);
  });

  it("finds the first truthy element", () => {
    expect(findFirstTruthy([0, "", false, null, "hit", "next"])).toBe("hit");
    expect(findFirstTruthy([0, false, null])).toBeUndefined();
  });

  it("formats dates with the canonical patterns", () => {
    expect(formatDate("2024-01-15")).toBe("15.01.2024");
    expect(formatDateUpsert("2024-01-15")).toBe("2024-01-15");
  });

  it("mirrors a persistent signal into its storage", () => {
    type CountData = { count: number };
    const store = new Map<keyof CountData, number>([["count", 1]]);
    const persistent = createPersistentSignal<CountData, "count">(
      {
        get: <K extends keyof CountData>(key: K): CountData[K] => store.get(key) as CountData[K],
        set: <K extends keyof CountData>(key: K, value: CountData[K]): void => void store.set(key, value as number),
      },
      "count",
    );

    expect(persistent.signal.value).toBe(1);
    persistent.setLocal(5);
    expect(persistent.signal.value).toBe(5);
    expect(store.get("count")).toBe(5);
  });

  it("sanitizes axios errors without leaking internals", () => {
    const sanitized = sanitizeAxiosError({
      name: "AxiosError",
      message: "Request failed",
      code: "ERR_BAD_RESPONSE",
      config: { method: "get" },
      response: { status: 500 },
    } as never);

    expect(sanitized).toMatchObject({ name: "AxiosError", status: 500, method: "GET" });
  });
});
