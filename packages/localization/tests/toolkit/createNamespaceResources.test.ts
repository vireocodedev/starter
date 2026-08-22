import { createNamespaceResources } from "@/toolkit/createNamespaceResources";
import { describe, expect, it } from "vitest";

const baseResources = {
  en: { common: { save: "Save", cancel: "Cancel" } },
  hr: { common: { save: "Spremi", cancel: "Odustani" } },
};

describe("createNamespaceResources", () => {
  it("uses shipped locales, seeds new locales, and layers partial overrides", () => {
    const resources = createNamespaceResources({
      namespace: "platform",
      baseResources,
      seedFrom: "en",
      locales: ["en", "hr", "de"] as const,
      overrides: { de: { common: { save: "Speichern" } } },
    });

    expect(resources.en.platform).toEqual(baseResources.en);
    expect(resources.hr.platform).toEqual(baseResources.hr);
    expect(resources.de.platform).toEqual({ common: { save: "Speichern", cancel: "Cancel" } });
  });

  it("isolates every generated locale from source and sibling resources", () => {
    const resources = createNamespaceResources({
      namespace: "platform",
      baseResources,
      seedFrom: "en",
      locales: ["de", "it"] as const,
    });

    resources.de.platform.common.save = "Speichern";

    expect(resources.it.platform.common.save).toBe("Save");
    expect(baseResources.en.common.save).toBe("Save");
  });

  it("rejects invalid namespace configuration early", () => {
    expect(() => createNamespaceResources({ namespace: " ", baseResources, seedFrom: "en", locales: ["en"] })).toThrow(
      "non-empty namespace",
    );
    expect(() =>
      createNamespaceResources({
        namespace: "platform",
        baseResources,
        seedFrom: "missing" as "en",
        locales: ["en"],
      }),
    ).toThrow('seed locale "missing"');
    expect(() =>
      createNamespaceResources({ namespace: "platform", baseResources, seedFrom: "en", locales: ["en", "en"] }),
    ).toThrow("unique locale identifiers");
    expect(() =>
      createNamespaceResources({ namespace: "platform", baseResources, seedFrom: "en", locales: [] }),
    ).toThrow("at least one locale identifier");
    expect(() =>
      createNamespaceResources({ namespace: "platform", baseResources, seedFrom: "en", locales: [" en"] }),
    ).toThrow("non-empty, trimmed locale identifiers");
    expect(() =>
      createNamespaceResources({
        namespace: "platform",
        baseResources,
        seedFrom: "en",
        locales: ["en"] as const,
        overrides: { hr: { common: { save: "Spremi" } } } as never,
      }),
    ).toThrow('override for unrequested locale "hr"');
  });
});
