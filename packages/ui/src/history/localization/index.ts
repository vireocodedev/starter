import HISTORY_EN from "@/history/localization/history.en";
import HISTORY_HR from "@/history/localization/history.hr";
import { createNamespaceResources, type DeepPartial, type WidenLeaves } from "@vireocodedev/starter-localization";

export { useHistoryTranslation } from "@/history/localization/hooks/useHistoryTranslation";
export { HISTORY_TRANSLATION_NAMESPACE, type HistoryTranslationNamespace } from "@/history/localization/namespace";

import { HISTORY_TRANSLATION_NAMESPACE } from "@/history/localization/namespace";

/** The canonical resource shape. English is the single source of truth. */
export type HistoryResources = typeof HISTORY_EN;

/** A recursively partial resource, used for per-locale value overrides. */
export type HistoryResourcesOverride = DeepPartial<HistoryResources>;

/** The resource shape with leaf string literals widened to `string`. */
export type HistoryResourcesShape = WidenLeaves<HistoryResources>;

/** Locales the History module ships out of the box. */
export const HISTORY_BASE_LOCALES = ["en", "hr"] as const;
export type HistoryBaseLocale = (typeof HISTORY_BASE_LOCALES)[number];

export const historyBaseResources: Record<HistoryBaseLocale, HistoryResourcesShape> = {
  en: HISTORY_EN,
  hr: HISTORY_HR,
};

export type CreateHistoryResourcesConfig<L extends string> = {
  /** The full set of locales the consumer app wants to support. */
  locales: readonly L[];
  /** Base locale used to seed locales the module does not ship. Defaults to `"en"`. */
  seedFrom?: HistoryBaseLocale;
  /** Optional per-locale value overrides, deep-merged over the seeded base. */
  overrides?: Partial<Record<L, HistoryResourcesOverride>>;
};

/**
 * Builds a fully-populated History resource map for every requested locale.
 */
export function createHistoryResources<L extends string>(
  config: CreateHistoryResourcesConfig<L>,
): Record<L, { [HISTORY_TRANSLATION_NAMESPACE]: HistoryResources }> {
  return createNamespaceResources({
    namespace: HISTORY_TRANSLATION_NAMESPACE,
    baseResources: historyBaseResources,
    seedFrom: config.seedFrom ?? "en",
    locales: config.locales,
    overrides: config.overrides,
  }) as Record<L, { [HISTORY_TRANSLATION_NAMESPACE]: HistoryResources }>;
}
