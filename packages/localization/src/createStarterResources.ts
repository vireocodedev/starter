import {
  createHistoryResources,
  HISTORY_TRANSLATION_NAMESPACE,
  type HistoryResources,
  type HistoryResourcesOverride,
} from "@/history";
import {
  createPlatformResources,
  PLATFORM_TRANSLATION_NAMESPACE,
  type PlatformResources,
  type PlatformResourcesOverride,
} from "@/platform";
import {
  createQueryEngineResources,
  QUERYENGINE_TRANSLATION_NAMESPACE,
  type QueryEngineResources,
  type QueryEngineResourcesOverride,
} from "@/queryengine";
import { type i18n as I18nInstance } from "i18next";

/** Every i18next namespace shipped by the starter libraries. */
export const STARTER_TRANSLATION_NAMESPACES = [
  PLATFORM_TRANSLATION_NAMESPACE,
  QUERYENGINE_TRANSLATION_NAMESPACE,
  HISTORY_TRANSLATION_NAMESPACE,
] as const;

export type StarterTranslationNamespace = (typeof STARTER_TRANSLATION_NAMESPACES)[number];

/** Locales every starter namespace ships out of the box. */
export const STARTER_BASE_LOCALES = ["en", "hr"] as const;
export type StarterBaseLocale = (typeof STARTER_BASE_LOCALES)[number];

/** The resources contributed by the starter libraries, keyed by namespace. */
export type StarterNamespaceResources = {
  [PLATFORM_TRANSLATION_NAMESPACE]: PlatformResources;
  [QUERYENGINE_TRANSLATION_NAMESPACE]: QueryEngineResources;
  [HISTORY_TRANSLATION_NAMESPACE]: HistoryResources;
};

/** Per-locale, per-namespace value overrides. */
export type StarterResourcesOverride = {
  [PLATFORM_TRANSLATION_NAMESPACE]?: PlatformResourcesOverride;
  [QUERYENGINE_TRANSLATION_NAMESPACE]?: QueryEngineResourcesOverride;
  [HISTORY_TRANSLATION_NAMESPACE]?: HistoryResourcesOverride;
};

export type CreateStarterResourcesConfig<L extends string> = {
  /** The full set of locales the consumer app wants to support. */
  locales: readonly L[];
  /** Base locale used to seed locales the starter does not ship. Defaults to `"en"`. */
  seedFrom?: StarterBaseLocale;
  /** Optional per-locale, per-namespace value overrides, deep-merged over the seeded base. */
  overrides?: Partial<Record<L, StarterResourcesOverride>>;
};

/** Narrows the per-locale override map down to a single namespace. */
function namespaceOverrides<L extends string, N extends keyof StarterResourcesOverride>(
  locales: readonly L[],
  overrides: Partial<Record<L, StarterResourcesOverride>> | undefined,
  namespace: N,
): Partial<Record<L, NonNullable<StarterResourcesOverride[N]>>> | undefined {
  if (!overrides) {
    return undefined;
  }

  const result: Partial<Record<L, NonNullable<StarterResourcesOverride[N]>>> = {};
  for (const locale of locales) {
    const override = overrides[locale]?.[namespace];
    if (override) {
      result[locale] = override as NonNullable<StarterResourcesOverride[N]>;
    }
  }

  return result;
}

/**
 * Builds every starter-owned namespace for the requested locales in a single
 * call, so apps spread one object per locale into their i18next resources and
 * pick up new starter namespaces without touching their wiring.
 */
export function createStarterResources<L extends string>(
  config: CreateStarterResourcesConfig<L>,
): Record<L, StarterNamespaceResources> {
  const { locales, seedFrom, overrides } = config;

  const platform = createPlatformResources({
    locales,
    seedFrom,
    overrides: namespaceOverrides(locales, overrides, PLATFORM_TRANSLATION_NAMESPACE),
  });
  const queryengine = createQueryEngineResources({
    locales,
    seedFrom,
    overrides: namespaceOverrides(locales, overrides, QUERYENGINE_TRANSLATION_NAMESPACE),
  });
  const history = createHistoryResources({
    locales,
    seedFrom,
    overrides: namespaceOverrides(locales, overrides, HISTORY_TRANSLATION_NAMESPACE),
  });

  const result = {} as Record<L, StarterNamespaceResources>;
  for (const locale of locales) {
    result[locale] = {
      ...platform[locale],
      ...queryengine[locale],
      ...history[locale],
    };
  }

  return result;
}

/**
 * Imperatively registers every starter namespace onto an existing i18next
 * instance. Useful when resources are added after i18next has been initialized.
 */
export function registerStarterResources<L extends string>(
  i18n: I18nInstance,
  config: CreateStarterResourcesConfig<L>,
): void {
  const resources = createStarterResources(config);

  for (const locale of Object.keys(resources) as L[]) {
    for (const namespace of STARTER_TRANSLATION_NAMESPACES) {
      i18n.addResourceBundle(locale, namespace, resources[locale][namespace], true, true);
    }
  }
}
