import { createDatabaseOwnerStore } from "@/lifecycle/createDatabaseOwnerStore";
import { describe, expect, it } from "vitest";

describe("createDatabaseOwnerStore", () => {
  it("uses the injected storage and namespace", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    const owners = createDatabaseOwnerStore({ key: "starter:owner", getStorage: () => storage });

    expect(owners.read()).toBeNull();
    owners.persist("bruno");
    expect(owners.read()).toBe("bruno");
    owners.clear();
    expect(owners.read()).toBeNull();
  });
});
