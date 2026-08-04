import { createApiMessageResolver, type RgoApiMessageBuildKeyProps } from "@/utils/createApiMessageResolver";
import { describe, expect, it, vi } from "vitest";

type Entity = "product" | "invoice";

const buildKey = ({ entity, group, success, offline }: RgoApiMessageBuildKeyProps<Entity>) =>
  `api.${entity}.${group}.${success ? "success" : "error"}${offline ? ".offline" : ""}`;

describe("createApiMessageResolver", () => {
  it("translates the key produced by buildKey", () => {
    const t = vi.fn((key: string) => `translated:${key}`);
    const resolve = createApiMessageResolver<Entity, string>({ t, isOffline: () => false, buildKey });

    expect(resolve({ group: "CREATE", success: true, entity: "product" })).toBe(
      "translated:api.product.CREATE.success",
    );
    expect(t).toHaveBeenCalledWith("api.product.CREATE.success");
  });

  it("distinguishes success from failure and one group from another", () => {
    const resolve = createApiMessageResolver<Entity, string>({
      t: key => key,
      isOffline: () => false,
      buildKey,
    });

    expect(resolve({ group: "DELETE", success: false, entity: "invoice" })).toBe("api.invoice.DELETE.error");
    expect(resolve({ group: "UPDATE", success: true, entity: "invoice" })).toBe("api.invoice.UPDATE.success");
  });

  it("selects the offline variant when isOffline reports true", () => {
    const resolve = createApiMessageResolver<Entity, string>({
      t: key => key,
      isOffline: () => true,
      buildKey,
    });

    expect(resolve({ group: "CREATE", success: true, entity: "product" })).toBe("api.product.CREATE.success.offline");
  });

  it("re-reads the offline state on every call rather than capturing it once", () => {
    let offline = false;
    const isOffline = vi.fn(() => offline);
    const resolve = createApiMessageResolver<Entity, string>({ t: key => key, isOffline, buildKey });

    expect(resolve({ group: "CREATE", success: true, entity: "product" })).toBe("api.product.CREATE.success");
    offline = true;
    expect(resolve({ group: "CREATE", success: true, entity: "product" })).toBe("api.product.CREATE.success.offline");
    expect(isOffline).toHaveBeenCalledTimes(2);
  });
});
