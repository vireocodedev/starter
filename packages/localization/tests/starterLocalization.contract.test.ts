import HISTORY_EN from "@/history/history.en";
import HISTORY_HR from "@/history/history.hr";
import { createStarterResources, STARTER_BASE_LOCALES, STARTER_TRANSLATION_NAMESPACES } from "@/index";
import PLATFORM_EN from "@/platform/platform.en";
import PLATFORM_HR from "@/platform/platform.hr";
import QUERYENGINE_EN from "@/queryengine/queryengine.en";
import QUERYENGINE_HR from "@/queryengine/queryengine.hr";
import { describe, expect, it } from "vitest";

type Assert<T extends true> = T;
type IsExact<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? (<T>() => T extends TRight ? 1 : 2) extends <T>() => T extends TLeft ? 1 : 2
      ? true
      : false
    : false;

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

function flattenValues(obj: JsonRecord, prefix = ""): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return value !== null && typeof value === "object" && !Array.isArray(value)
        ? Object.entries(flattenValues(value as JsonRecord, path))
        : [[path, String(value)]];
    }),
  );
}

function interpolationVariables(value: string): string[] {
  return [...value.matchAll(/\{\{\s*([^},\s]+)[^}]*\}\}/gu)].map(match => match[1] ?? "").sort();
}

/**
 * Every starter key set is a versioned contract: removing/renaming a key or a
 * base locale is a breaking change. These explicit expected lists fail CI on any
 * unintended change, so the surface can only move deliberately (and be reviewed).
 */
const EXPECTED_PLATFORM_KEYS = [
  "auth.currentUserLoadFailed",
  "auth.discardPendingSyncCancel",
  "auth.discardPendingSyncConfirm",
  "auth.discardPendingSyncMessage",
  "auth.discardPendingSyncTitle",
  "auth.invalidCredentials",
  "auth.password",
  "auth.sessionExpired",
  "auth.signIn",
  "auth.signInSubtitle",
  "auth.signedInAs",
  "auth.username",
  "common.actions",
  "common.ascending",
  "common.ascendingSortDirection",
  "common.back",
  "common.bottomNavigation",
  "common.cancel",
  "common.clearAll",
  "common.clearSearch",
  "common.closeFilters",
  "common.closeNavigation",
  "common.collapse",
  "common.column",
  "common.create",
  "common.dark",
  "common.delete",
  "common.descending",
  "common.descendingSortDirection",
  "common.direction",
  "common.discard",
  "common.done",
  "common.download",
  "common.edit",
  "common.expand",
  "common.filters",
  "common.language",
  "common.light",
  "common.loading",
  "common.logout",
  "common.mainNavigation",
  "common.month",
  "common.more",
  "common.name",
  "common.no",
  "common.noRecordsFound",
  "common.openFilters",
  "common.profile",
  "common.save",
  "common.search",
  "common.settings",
  "common.skipToMainContent",
  "common.theme",
  "common.year",
  "common.yes",
  "network.actionQueued",
  "network.actionUnavailable",
  "network.commandId",
  "network.connectingToLiveUpdates",
  "network.createdAt",
  "network.dataUnavailable",
  "network.diagnostics",
  "network.errorMessage",
  "network.failedLoadingData",
  "network.httpMethod",
  "network.hydratingInBackground",
  "network.lastHeartbeat",
  "network.lastSyncFailure",
  "network.mutationQueuedOffline",
  "network.offline",
  "network.offlineBanner",
  "network.offlineModeNotSupported",
  "network.offlineQueuePending",
  "network.online",
  "network.owner",
  "network.processedAt",
  "network.queuePermanentlyFailed",
  "network.queueSize",
  "network.queueSynced",
  "network.reconnecting",
  "network.responseStatus",
  "network.searchSyncCommands",
  "network.status",
  "network.syncCommands",
  "network.syncFailures",
  "network.syncIdle",
  "network.syncInProgress",
  "network.syncStatus",
  "network.unavailable",
  "network.url",
  "network.youAreOffline",
  "pwa.newVersionAvailable",
  "pwa.reload",
  "routing.errorChunkMessage",
  "routing.errorGenericMessage",
  "routing.errorOfflineMessage",
  "routing.errorRefresh",
  "routing.errorRetry",
  "routing.errorTitle",
  "routing.goHome",
  "routing.notFoundMessage",
  "routing.notFoundTitle",
  "routing.unauthorizedMessage",
  "routing.unauthorizedTitle",
  "settings.lockNavigationBar",
  "settings.noMaxWidth",
  "settings.pageBodyMaxWidth",
  "settings.pageBodyMaxWidthLg",
  "settings.pageBodyMaxWidthMd",
  "settings.pageBodyMaxWidthSm",
  "settings.pageBodyMaxWidthXl",
  "settings.pageBodyMaxWidthXs",
  "settings.title",
  "settings.userSettingsSavedSuccessfully",
  "unsavedChanges.discardAndLeave",
  "unsavedChanges.message",
  "unsavedChanges.savingMessage",
  "unsavedChanges.savingTitle",
  "unsavedChanges.stay",
  "unsavedChanges.title",
  "validation.thisFieldIsRequired",
].sort();

const EXPECTED_QUERYENGINE_KEYS = [
  "addFilter",
  "availableEntities",
  "backendConfiguration",
  "entityKey",
  "entityType",
  "fieldsCountLabel",
  "filters",
  "fromDate",
  "noFilterableFields",
  "noFiltersAdded",
  "ok",
  "operator",
  "operators.CONTAINS",
  "operators.DATE_RANGE",
  "operators.ENDS_WITH",
  "operators.EQUALS",
  "operators.GREATER_OR_EQUAL",
  "operators.GREATER_THAN",
  "operators.IN",
  "operators.IS_NOT_NULL",
  "operators.IS_NULL",
  "operators.LESS_OR_EQUAL",
  "operators.LESS_THAN",
  "operators.NOT_EQUALS",
  "operators.STARTS_WITH",
  "relationType",
  "renderedFilterJson",
  "rowsJson",
  "rowsJsonPlaceholder",
  "subtitle",
  "title",
  "toDate",
  "value",
].sort();

const EXPECTED_HISTORY_KEYS = ["empty", "hideUnchanged", "showUnchanged", "title", "viewHistory"].sort();

describe.each([
  ["platform", PLATFORM_EN, PLATFORM_HR, EXPECTED_PLATFORM_KEYS],
  ["queryengine", QUERYENGINE_EN, QUERYENGINE_HR, EXPECTED_QUERYENGINE_KEYS],
  ["history", HISTORY_EN, HISTORY_HR, EXPECTED_HISTORY_KEYS],
] as const)("%s localization contract", (_namespace, en, hr, expectedKeys) => {
  it("keeps the key surface stable", () => {
    expect(flattenKeys(en as JsonRecord)).toEqual(expectedKeys);
  });

  it("keeps every base locale structurally identical to the canonical (en) shape", () => {
    expect(flattenKeys(hr as JsonRecord)).toEqual(flattenKeys(en as JsonRecord));
  });

  it("ships non-blank values with the canonical interpolation variables", () => {
    const canonicalValues = flattenValues(en as JsonRecord);
    const localizedValues = flattenValues(hr as JsonRecord);

    for (const [key, canonicalValue] of Object.entries(canonicalValues)) {
      expect(canonicalValue.trim(), `${_namespace}.${key} has a blank English value`).not.toBe("");
      expect(localizedValues[key]?.trim(), `${_namespace}.${key} has a blank Croatian value`).not.toBe("");
      expect(
        interpolationVariables(localizedValues[key] ?? ""),
        `${_namespace}.${key} changes interpolation variables`,
      ).toEqual(interpolationVariables(canonicalValue));
    }
  });
});

describe("starter localization contract", () => {
  it("types localized and overridden values as strings rather than English literals", () => {
    const resources = createStarterResources({
      locales: ["hr"] as const,
      overrides: { hr: { history: { title: "Revizijski trag" } } },
    });

    type TitleIsString = Assert<IsExact<typeof resources.hr.history.title, string>>;
    const titleIsString: TitleIsString = true;

    expect(titleIsString).toBe(true);
    expect(resources.hr.history.title).toBe("Revizijski trag");
  });

  it("ships the expected base locales", () => {
    expect([...STARTER_BASE_LOCALES]).toEqual(["en", "hr"]);
  });

  it("ships the expected namespaces", () => {
    expect([...STARTER_TRANSLATION_NAMESPACES]).toEqual(["platform", "queryengine", "history"]);
  });

  it("builds every namespace for every requested locale", () => {
    const resources = createStarterResources({
      locales: ["en", "hr"] as const,
    });

    expect(Object.keys(resources).sort()).toEqual(["en", "hr"]);
    for (const locale of ["en", "hr"] as const) {
      expect(Object.keys(resources[locale]).sort()).toEqual(["history", "platform", "queryengine"]);
    }
  });

  it("seeds unshipped locales from the base locale", () => {
    const resources = createStarterResources({
      locales: ["en", "de"] as const,
    });

    expect(resources.de.platform).toEqual(resources.en.platform);
    expect(resources.de.queryengine).toEqual(resources.en.queryengine);
    expect(resources.de.history).toEqual(resources.en.history);
  });

  it("deep-merges per-namespace overrides without dropping sibling keys", () => {
    const resources = createStarterResources({
      locales: ["en"] as const,
      overrides: {
        en: {
          platform: { common: { save: "Store" } },
          history: { title: "Audit trail" },
        },
      },
    });

    expect(resources.en.platform.common.save).toBe("Store");
    expect(resources.en.platform.common.cancel).toBe(PLATFORM_EN.common.cancel);
    expect(resources.en.history.title).toBe("Audit trail");
    expect(resources.en.history.empty).toBe(HISTORY_EN.empty);
    expect(resources.en.queryengine).toEqual(QUERYENGINE_EN);
  });

  it("rejects invalid aggregate locale configuration before building namespaces", () => {
    expect(() => createStarterResources({ locales: [] })).toThrow("at least one locale identifier");
    expect(() =>
      createStarterResources({
        locales: ["en"] as const,
        overrides: { de: { history: { title: "Verlauf" } } } as never,
      }),
    ).toThrow('override for unrequested locale "de"');
  });
});
