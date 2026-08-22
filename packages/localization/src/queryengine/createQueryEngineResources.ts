import { QUERYENGINE_TRANSLATION_NAMESPACE } from "./namespace";
import QUERYENGINE_EN from "./queryengine.en";
import QUERYENGINE_HR from "./queryengine.hr";
import { createNamespaceResources, type DeepPartial, type WidenLeaves } from "../toolkit/createNamespaceResources";

export { QUERYENGINE_TRANSLATION_NAMESPACE, type QueryEngineTranslationNamespace } from "./namespace";

/** The canonical Query Engine resource shape. English is the key source of truth. */
export type QueryEngineResources = WidenLeaves<typeof QUERYENGINE_EN>;

/**
 * A recursively partial resource, used for per-locale value overrides. Leaves
 * are widened, so an override may supply any string for a shipped key.
 */
export type QueryEngineResourcesOverride = DeepPartial<QueryEngineResources>;

/** Locales the QueryEngine namespace ships out of the box. */
export const QUERYENGINE_BASE_LOCALES = ["en", "hr"] as const;
export type QueryEngineBaseLocale = (typeof QUERYENGINE_BASE_LOCALES)[number];

export const queryEngineBaseResources: Record<QueryEngineBaseLocale, QueryEngineResources> = {
  en: QUERYENGINE_EN,
  hr: QUERYENGINE_HR,
};

export type CreateQueryEngineResourcesConfig<L extends string> = {
  /** The full set of locales the consumer app wants to support. */
  locales: readonly L[];
  /** Base locale used to seed locales the namespace does not ship. Defaults to `"en"`. */
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
  });
}
