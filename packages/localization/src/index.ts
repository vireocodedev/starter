import { PLATFORM_TRANSLATION_NAMESPACE } from "@/namespace";
import PLATFORM_EN from "@/platform.en";
import PLATFORM_HR from "@/platform.hr";
import { createNamespaceResources, type DeepPartial, type WidenLeaves } from "@/toolkit/createNamespaceResources";
import { type i18n as I18nInstance } from "i18next";

export { usePlatformTranslation } from "@/hooks/usePlatformTranslation";
export { PLATFORM_TRANSLATION_NAMESPACE, type PlatformTranslationNamespace } from "@/namespace";
export { createNamespaceResources, type DeepPartial, type WidenLeaves } from "@/toolkit/createNamespaceResources";
export { deepMerge } from "@/toolkit/deepMerge";

/** The canonical resource shape. English is the single source of truth. */
export type PlatformResources = typeof PLATFORM_EN;

/** A recursively partial platform resource, used for per-locale value overrides. */
export type PlatformResourcesOverride = DeepPartial<PlatformResources>;

/**
 * The platform resource shape with leaf string literals widened to `string`.
 * Non-English base locales share the shape but not the literal values, so the
 * base map is typed against this widened form.
 */
export type PlatformResourcesShape = WidenLeaves<PlatformResources>;

/** Locales the platform ships out of the box. */
export const PLATFORM_BASE_LOCALES = ["en", "hr"] as const;
export type PlatformBaseLocale = (typeof PLATFORM_BASE_LOCALES)[number];

export const platformBaseResources: Record<PlatformBaseLocale, PlatformResourcesShape> = {
  en: PLATFORM_EN,
  hr: PLATFORM_HR,
};

/** @deprecated Prefer {@link platformBaseResources} or {@link createPlatformResources}. */
export const PLATFORM_TRANSLATION_RESOURCES = platformBaseResources;

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

/**
 * Imperatively registers platform resources onto an existing i18next instance.
 * Useful when resources are added after i18next has already been initialized.
 */
export function registerPlatformResources<L extends string>(
  i18n: I18nInstance,
  config: CreatePlatformResourcesConfig<L>,
): void {
  const resources = createPlatformResources(config);
  for (const locale of Object.keys(resources) as L[]) {
    i18n.addResourceBundle(
      locale,
      PLATFORM_TRANSLATION_NAMESPACE,
      resources[locale][PLATFORM_TRANSLATION_NAMESPACE],
      true,
      true,
    );
  }
}

// TODO: test comment
