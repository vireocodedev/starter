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
  type CreatePlatformResourcesConfig,
  type PlatformBaseLocale,
  type PlatformResources,
  type PlatformResourcesOverride,
  type PlatformTranslationNamespace,
} from "@/platform/createPlatformResources";

export {
  createQueryEngineResources,
  queryEngineBaseResources,
  QUERYENGINE_BASE_LOCALES,
  QUERYENGINE_TRANSLATION_NAMESPACE,
  type CreateQueryEngineResourcesConfig,
  type QueryEngineBaseLocale,
  type QueryEngineResources,
  type QueryEngineResourcesOverride,
  type QueryEngineTranslationNamespace,
} from "@/queryengine/createQueryEngineResources";

export {
  createHistoryResources,
  historyBaseResources,
  HISTORY_BASE_LOCALES,
  HISTORY_TRANSLATION_NAMESPACE,
  type CreateHistoryResourcesConfig,
  type HistoryBaseLocale,
  type HistoryResources,
  type HistoryResourcesOverride,
  type HistoryTranslationNamespace,
} from "@/history/createHistoryResources";

export { createNamespaceResources, type DeepPartial, type WidenLeaves } from "@/toolkit/createNamespaceResources";
export { deepMerge } from "@/toolkit/deepMerge";
export { formatIntlNumber, type IntlNumberFormatRequest } from "@/formatters/intlNumberFormat";
