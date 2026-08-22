import { describe, expect, it } from "vitest";
import { resolveVireoPageLayoutMode } from "@/capabilities/page-layout/utils/pageLayout.utils";

describe("resolveVireoPageLayoutMode", () => {
  it("uses hysteresis so container resize does not oscillate around thresholds", () => {
    expect(resolveVireoPageLayoutMode(590, "compact")).toBe("compact");
    expect(resolveVireoPageLayoutMode(621, "compact")).toBe("regular");
    expect(resolveVireoPageLayoutMode(1100, "wide")).toBe("wide");
    expect(resolveVireoPageLayoutMode(1079, "wide")).toBe("regular");
  });
});
