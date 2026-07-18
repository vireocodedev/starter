import { PLATFORM_BASE_LOCALES } from "@/index";
import PLATFORM_EN from "@/platform.en";
import PLATFORM_HR from "@/platform.hr";
import { describe, expect, it } from "vitest";

type JsonRecord = Record<string, unknown>;

/** Returns the sorted set of dotted leaf key paths for a resource object. */
function flattenKeys(obj: JsonRecord, prefix = ""): string[] {
  return Object.entries(obj)
    .flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return value !== null && typeof value === "object" && !Array.isArray(value)
        ? flattenKeys(value as JsonRecord, path)
        : [path];
    })
    .sort();
}

/**
 * The platform key set is a versioned contract: removing/renaming a key or a
 * base locale is a breaking change. This explicit expected list fails CI on any
 * unintended change, so the surface can only move deliberately (and be reviewed).
 */
const EXPECTED_PLATFORM_KEYS = [
  "common.ascending",
  "common.ascendingSortDirection",
  "common.cancel",
  "common.clearAll",
  "common.clearSearch",
  "common.closeFilters",
  "common.column",
  "common.create",
  "common.descending",
  "common.descendingSortDirection",
  "common.direction",
  "common.done",
  "common.filters",
  "common.loading",
  "common.no",
  "common.noRecordsFound",
  "common.openFilters",
  "common.save",
  "common.search",
  "common.yes",
  "network.actionUnavailable",
  "network.dataUnavailable",
  "network.failedLoadingData",
  "network.offlineBanner",
  "pwa.newVersionAvailable",
  "pwa.reload",
].sort();

describe("platform localization contract", () => {
  it("ships the expected base locales", () => {
    expect([...PLATFORM_BASE_LOCALES]).toEqual(["en", "hr"]);
  });

  it("keeps the platform key surface stable", () => {
    expect(flattenKeys(PLATFORM_EN as JsonRecord)).toEqual(EXPECTED_PLATFORM_KEYS);
  });

  it("keeps every base locale structurally identical to the canonical (en) shape", () => {
    expect(flattenKeys(PLATFORM_HR as JsonRecord)).toEqual(flattenKeys(PLATFORM_EN as JsonRecord));
  });
});
