import { getHistoryPathKey } from "./getHistoryPathKey";
import { describe, expect, it } from "vitest";

describe(getHistoryPathKey, () => {
  it("creates unambiguous keys for typed and nested path segments", () => {
    expect(getHistoryPathKey([])).toBe("$root");
    expect(getHistoryPathKey(["items", 1])).not.toBe(getHistoryPathKey(["items", "1"]));
    expect(getHistoryPathKey(["a.b"])).not.toBe(getHistoryPathKey(["a", "b"]));
  });
});
