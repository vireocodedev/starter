import { createNamespaceResources, createStarterResources } from "@vireocodedev/starter-localization";

const baseResources = {
  en: { actions: { save: "Save" } },
};

function captureFailure(run: () => unknown): string {
  try {
    run();
    return "No error was raised.";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function runFailureSemanticsExample() {
  return {
    noLocales: captureFailure(() => createStarterResources({ locales: [] })),
    duplicateLocale: captureFailure(() => createStarterResources({ locales: ["en", "en"] })),
    unrequestedOverride: captureFailure(() =>
      createStarterResources({
        locales: ["en"] as const,
        overrides: { de: { history: { title: "Verlauf" } } } as never,
      }),
    ),
    missingSeed: captureFailure(() =>
      createNamespaceResources({
        namespace: "product",
        baseResources,
        seedFrom: "hr" as "en",
        locales: ["en"],
      }),
    ),
  };
}
