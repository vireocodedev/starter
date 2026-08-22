import { PLATFORM_TRANSLATION_NAMESPACE } from "@/platform/namespace";
import PLATFORM_EN from "@/platform/platform.en";
import PLATFORM_HR from "@/platform/platform.hr";
import { createNamespaceResources, type DeepPartial, type WidenLeaves } from "@/toolkit/createNamespaceResources";

export { PLATFORM_TRANSLATION_NAMESPACE, type PlatformTranslationNamespace } from "@/platform/namespace";

/** The canonical resource shape. English is the single source of truth. */
export type PlatformResources = typeof PLATFORM_EN;

/**
 * The platform resource shape with leaf string literals widened to `string`.
 * Non-English base locales share the shape but not the literal values, so the
 * base map is typed against this widened form.
 */
export type PlatformResourcesShape = WidenLeaves<PlatformResources>;

/**
 * A recursively partial platform resource, used for per-locale value overrides.
 * Leaves are widened, so an override may supply any string for a shipped key.
 */
export type PlatformResourcesOverride = DeepPartial<PlatformResourcesShape>;

/** Locales the platform ships out of the box. */
export const PLATFORM_BASE_LOCALES = ["en", "hr"] as const;
export type PlatformBaseLocale = (typeof PLATFORM_BASE_LOCALES)[number];

export const platformBaseResources: Record<PlatformBaseLocale, PlatformResourcesShape> = {
  en: PLATFORM_EN,
  hr: PLATFORM_HR,
};

export type CreatePlatformResourcesConfig<L extends string> = {
  /** The full set of locales the consumer app wants to support. */
  locales: readonly L[];
  /** Base locale used to seed locales the platform does not ship. Defaults to `"en"`. */
  seedFrom?: PlatformBaseLocale;
  /** Optional per-locale value overrides, deep-merged over the seeded base. */
  overrides?: Partial<Record<L, PlatformResourcesOverride>>;
};

/**
 * Builds a fully-populated platform resource map for every requested locale.
 *
 * Consumers can override any shipped value per locale and add brand-new
 * languages (seeded from a base locale until translated) without ever ending
 * up with a missing platform key.
 */
export function createPlatformResources<L extends string>(
  config: CreatePlatformResourcesConfig<L>,
): Record<L, { [PLATFORM_TRANSLATION_NAMESPACE]: PlatformResources }> {
  return createNamespaceResources({
    namespace: PLATFORM_TRANSLATION_NAMESPACE,
    baseResources: platformBaseResources,
    seedFrom: config.seedFrom ?? "en",
    locales: config.locales,
    overrides: config.overrides,
  }) as Record<L, { [PLATFORM_TRANSLATION_NAMESPACE]: PlatformResources }>;
}
