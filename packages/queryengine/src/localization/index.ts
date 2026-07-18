import QUERYENGINE_EN from "@/localization/queryengine.en";
import QUERYENGINE_HR from "@/localization/queryengine.hr";
import { createNamespaceResources, type DeepPartial, type WidenLeaves } from "@vireocodedev/starter-localization";

export { useQueryEngineTranslation } from "@/localization/hooks/useQueryEngineTranslation";
export { QUERYENGINE_TRANSLATION_NAMESPACE, type QueryEngineTranslationNamespace } from "@/localization/namespace";

import { QUERYENGINE_TRANSLATION_NAMESPACE } from "@/localization/namespace";

/** The canonical resource shape. English is the single source of truth. */
export type QueryEngineResources = typeof QUERYENGINE_EN;

/** A recursively partial resource, used for per-locale value overrides. */
export type QueryEngineResourcesOverride = DeepPartial<QueryEngineResources>;

/** The resource shape with leaf string literals widened to `string`. */
export type QueryEngineResourcesShape = WidenLeaves<QueryEngineResources>;

/** Locales the QueryEngine module ships out of the box. */
export const QUERYENGINE_BASE_LOCALES = ["en", "hr"] as const;
export type QueryEngineBaseLocale = (typeof QUERYENGINE_BASE_LOCALES)[number];

export const queryEngineBaseResources: Record<QueryEngineBaseLocale, QueryEngineResourcesShape> = {
  en: QUERYENGINE_EN,
  hr: QUERYENGINE_HR,
};

export type CreateQueryEngineResourcesConfig<L extends string> = {
  /** The full set of locales the consumer app wants to support. */
  locales: readonly L[];
  /** Base locale used to seed locales the module does not ship. Defaults to `"en"`. */
  seedFrom?: QueryEngineBaseLocale;
  /** Optional per-locale value overrides, deep-merged over the seeded base. */
  overrides?: Partial<Record<L, QueryEngineResourcesOverride>>;
};

/**
 * Builds a fully-populated QueryEngine resource map for every requested locale.
 */
export function createQueryEngineResources<L extends string>(
  config: CreateQueryEngineResourcesConfig<L>,
): Record<L, { [QUERYENGINE_TRANSLATION_NAMESPACE]: QueryEngineResources }> {
  return createNamespaceResources({
    namespace: QUERYENGINE_TRANSLATION_NAMESPACE,
    baseResources: queryEngineBaseResources,
    seedFrom: config.seedFrom ?? "en",
    locales: config.locales,
    overrides: config.overrides,
  }) as Record<L, { [QUERYENGINE_TRANSLATION_NAMESPACE]: QueryEngineResources }>;
}
