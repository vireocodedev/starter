import HISTORY_EN from "./history.en";
import HISTORY_HR from "./history.hr";
import { HISTORY_TRANSLATION_NAMESPACE } from "./namespace";
import { createNamespaceResources, type DeepPartial, type WidenLeaves } from "../toolkit/createNamespaceResources";

export { HISTORY_TRANSLATION_NAMESPACE, type HistoryTranslationNamespace } from "./namespace";

/** The canonical History resource shape. English is the key source of truth. */
export type HistoryResources = WidenLeaves<typeof HISTORY_EN>;

/**
 * A recursively partial resource, used for per-locale value overrides. Leaves
 * are widened, so an override may supply any string for a shipped key.
 */
export type HistoryResourcesOverride = DeepPartial<HistoryResources>;

/** Locales the History namespace ships out of the box. */
export const HISTORY_BASE_LOCALES = ["en", "hr"] as const;
export type HistoryBaseLocale = (typeof HISTORY_BASE_LOCALES)[number];

export const historyBaseResources: Record<HistoryBaseLocale, HistoryResources> = {
  en: HISTORY_EN,
  hr: HISTORY_HR,
};

export type CreateHistoryResourcesConfig<L extends string> = {
  /** The full set of locales the consumer app wants to support. */
  locales: readonly L[];
  /** Base locale used to seed locales the namespace does not ship. Defaults to `"en"`. */
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
  });
}
