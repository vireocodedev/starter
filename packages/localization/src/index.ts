import {
  createPlatformResources,
  PLATFORM_TRANSLATION_NAMESPACE,
  platformBaseResources,
  type CreatePlatformResourcesConfig,
} from "@/platform";
import { type i18n as I18nInstance } from "i18next";

export {
  createStarterResources,
  registerStarterResources,
  STARTER_BASE_LOCALES,
  STARTER_TRANSLATION_NAMESPACES,
  type CreateStarterResourcesConfig,
  type StarterBaseLocale,
  type StarterNamespaceResources,
  type StarterResourcesOverride,
  type StarterTranslationNamespace,
} from "@/createStarterResources";

export {
  createPlatformResources,
  platformBaseResources,
  PLATFORM_BASE_LOCALES,
  PLATFORM_TRANSLATION_NAMESPACE,
  usePlatformTranslation,
  type CreatePlatformResourcesConfig,
  type PlatformBaseLocale,
  type PlatformResources,
  type PlatformResourcesOverride,
  type PlatformResourcesShape,
  type PlatformTranslationNamespace,
} from "@/platform";

export {
  createQueryEngineResources,
  queryEngineBaseResources,
  QUERYENGINE_BASE_LOCALES,
  QUERYENGINE_TRANSLATION_NAMESPACE,
  useQueryEngineTranslation,
  type CreateQueryEngineResourcesConfig,
  type QueryEngineBaseLocale,
  type QueryEngineResources,
  type QueryEngineResourcesOverride,
  type QueryEngineResourcesShape,
  type QueryEngineTranslationNamespace,
} from "@/queryengine";

export {
  createHistoryResources,
  historyBaseResources,
  HISTORY_BASE_LOCALES,
  HISTORY_TRANSLATION_NAMESPACE,
  useHistoryTranslation,
  type CreateHistoryResourcesConfig,
  type HistoryBaseLocale,
  type HistoryResources,
  type HistoryResourcesOverride,
  type HistoryResourcesShape,
  type HistoryTranslationNamespace,
} from "@/history";

export { createNamespaceResources, type DeepPartial, type WidenLeaves } from "@/toolkit/createNamespaceResources";
export { deepMerge } from "@/toolkit/deepMerge";

/** @deprecated Prefer {@link platformBaseResources} or {@link createPlatformResources}. */
export const PLATFORM_TRANSLATION_RESOURCES = platformBaseResources;

/**
 * Imperatively registers platform resources onto an existing i18next instance.
 * Useful when resources are added after i18next has already been initialized.
 *
 * @deprecated Prefer `registerStarterResources`, which covers every starter namespace.
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
