import { deepMerge } from "@/toolkit/deepMerge";
import { describe, expect, it } from "vitest";

describe("deepMerge", () => {
  it("merges nested overrides without dropping siblings", () => {
    expect(
      deepMerge(
        { common: { save: "Save", cancel: "Cancel" }, statuses: ["open", "closed"] },
        { common: { save: "Store" } },
      ),
    ).toEqual({ common: { save: "Store", cancel: "Cancel" }, statuses: ["open", "closed"] });
  });

  it("replaces arrays and ignores undefined override values", () => {
    expect(deepMerge({ label: "Name", values: [1, 2] }, { label: undefined, values: [3] })).toEqual({
      label: "Name",
      values: [3],
    });
  });

  it("returns a deeply isolated result", () => {
    const base: { nested: { values: string[]; label?: string } } = { nested: { values: ["one"] } };
    const override = { nested: { label: "Translated" } };
    const result = deepMerge(base, override);

    result.nested.values.push("two");
    result.nested.label = "Changed";

    expect(base).toEqual({ nested: { values: ["one"] } });
    expect(override).toEqual({ nested: { label: "Translated" } });
  });

  it("ignores prototype-mutating object keys", () => {
    const malicious = JSON.parse('{"__proto__":{"polluted":true},"safe":"value"}') as object;
    const result = deepMerge({ original: true }, malicious);

    expect(result).toEqual({ original: true, safe: "value" });
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });
});
