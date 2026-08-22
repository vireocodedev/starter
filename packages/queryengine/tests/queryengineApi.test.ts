import { createQueryEngineApi, type QueryEngineHttpClient } from "@/api/queryengine.api";
import { describe, expect, it, vi } from "vitest";

const definition = { key: "customer/team", title: "Customers", fields: [] };

describe("createQueryEngineApi", () => {
  it("encodes opaque entity keys and field paths as URL segments", async () => {
    const get = vi.fn().mockResolvedValueOnce(definition).mockResolvedValueOnce([]);
    const api = createQueryEngineApi({ get });

    await api.describeEntity("customer/team");
    await api.listRelationOptions("customer/team", "owner/name", "Ada");

    expect(get).toHaveBeenNthCalledWith(1, "entities/customer%2Fteam", undefined);
    expect(get).toHaveBeenNthCalledWith(
      2,
      "entities/customer%2Fteam/fields/owner%2Fname/options",
      expect.objectContaining({ params: { searchText: "Ada" } }),
    );
  });

  it("preserves transport and validation failures when no legacy retry applies", async () => {
    const transportError = new Error("backend unavailable");
    const api = createQueryEngineApi({ get: vi.fn().mockRejectedValue(transportError) });
    await expect(api.describeEntity("customers")).rejects.toBe(transportError);

    const invalidApi = createQueryEngineApi({ get: vi.fn().mockResolvedValue({ key: "customers" }) });
    await expect(invalidApi.describeEntity("customers")).rejects.toMatchObject({ name: "ZodError" });
  });

  it("does not retry aborted requests through a legacy key", async () => {
    const controller = new AbortController();
    controller.abort();
    const abortError = new DOMException("cancelled", "AbortError");
    const get = vi.fn().mockRejectedValue(abortError);
    const api = createQueryEngineApi({ get } as QueryEngineHttpClient, { legacyEntityKey: () => "legacy" });

    await expect(api.describeEntity("customers", { signal: controller.signal })).rejects.toBe(abortError);
    expect(get).toHaveBeenCalledOnce();
  });

  it("rejects empty path inputs before invoking transport", async () => {
    const get = vi.fn();
    const api = createQueryEngineApi({ get });

    await expect(api.describeEntity(" ")).rejects.toThrow("entityKey must be a non-empty string.");
    await expect(api.listRelationOptions("customers", " ")).rejects.toThrow("fieldPath must be a non-empty string.");
    expect(get).not.toHaveBeenCalled();
  });
});
