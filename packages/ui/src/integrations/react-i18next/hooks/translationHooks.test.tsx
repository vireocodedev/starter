import { createStarterResources } from "@vireocodedev/starter-localization";
import { renderHook } from "@testing-library/react";
import i18next from "i18next";
import type { PropsWithChildren } from "react";
import React from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { describe, expect, it } from "vitest";
import { useHistoryTranslation } from "./useHistoryTranslation/useHistoryTranslation";
import { usePlatformTranslation } from "./usePlatformTranslation/usePlatformTranslation";
import { useQueryEngineTranslation } from "./useQueryEngineTranslation/useQueryEngineTranslation";

async function createWrapper() {
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    lng: "en",
    resources: createStarterResources({ locales: ["en"] }),
    showSupportNotice: false,
  });

  return function LocalizationWrapper({ children }: PropsWithChildren) {
    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
  };
}

describe("Starter translation hooks", () => {
  it("binds each UI hook to its owned namespace", async () => {
    const wrapper = await createWrapper();

    const platform = renderHook(() => usePlatformTranslation(), { wrapper });
    const queryengine = renderHook(() => useQueryEngineTranslation(), { wrapper });
    const history = renderHook(() => useHistoryTranslation(), { wrapper });

    expect(platform.result.current.t("common.save")).toBe("Save");
    expect(queryengine.result.current.t("addFilter")).toBe("+ Add filter");
    expect(history.result.current.t("title")).toBe("History");
  });
});
