import { createNamespaceResources } from "@vireocodedev/localization";

type ProductResources = {
  actions: {
    archive: string;
    restore: string;
  };
};

const baseResources: Record<"en" | "hr", ProductResources> = {
  en: { actions: { archive: "Archive", restore: "Restore" } },
  hr: { actions: { archive: "Arhiviraj", restore: "Vrati" } },
};

export function runCustomNamespaceExample() {
  return createNamespaceResources({
    namespace: "product",
    baseResources,
    seedFrom: "en",
    locales: ["en", "hr", "de"] as const,
    overrides: {
      de: { actions: { archive: "Archivieren" } },
    },
  });
}
