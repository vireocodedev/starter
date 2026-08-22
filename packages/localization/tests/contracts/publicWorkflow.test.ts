import {
  createStarterResources,
  formatIntlNumber,
  HISTORY_TRANSLATION_NAMESPACE,
  PLATFORM_TRANSLATION_NAMESPACE,
  QUERYENGINE_TRANSLATION_NAMESPACE,
  registerStarterResources,
} from "@/index";
import i18next from "i18next";
import { describe, expect, it } from "vitest";

describe("starter-localization public workflow", () => {
  it("creates app-ready resources with typed per-namespace overrides", () => {
    const resources = createStarterResources({
      locales: ["en", "hr", "de"] as const,
      overrides: {
        de: {
          platform: { common: { save: "Speichern" } },
          history: { title: "Verlauf" },
        },
      },
    });

    expect(resources.de.platform.common.save).toBe("Speichern");
    expect(resources.de.platform.common.cancel).toBe(resources.en.platform.common.cancel);
    expect(resources.de.history.title).toBe("Verlauf");
    expect(resources.de.queryengine.addFilter).toBe(resources.en.queryengine.addFilter);
  });

  it("registers every namespace onto a caller-owned i18next instance", async () => {
    const instance = i18next.createInstance();
    await instance.init({ lng: "en", resources: {}, showSupportNotice: false });

    registerStarterResources(instance, { locales: ["en", "hr"] as const });

    expect(instance.getResourceBundle("en", PLATFORM_TRANSLATION_NAMESPACE).common.save).toBe("Save");
    expect(instance.getResourceBundle("hr", QUERYENGINE_TRANSLATION_NAMESPACE).addFilter).toBe("+ Dodaj filter");
    expect(instance.getResourceBundle("hr", HISTORY_TRANSLATION_NAMESPACE).title).toBe("Povijest");
  });

  it("keeps formatting locale policy at the call site", () => {
    expect(formatIntlNumber(1234.5, { locale: "de-DE", options: { minimumFractionDigits: 1 } })).toBe("1.234,5");
  });
});
