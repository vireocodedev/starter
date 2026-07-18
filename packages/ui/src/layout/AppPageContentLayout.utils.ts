import {
  APP_PAGE_CONTENT_COMPACT_ENTER_WIDTH,
  APP_PAGE_CONTENT_COMPACT_EXIT_WIDTH,
  APP_PAGE_CONTENT_WIDE_ENTER_WIDTH,
  APP_PAGE_CONTENT_WIDE_EXIT_WIDTH,
} from "@/layout/shell.constants";
import { type AppPageContentLayout, type AppPageContentMode } from "@/layout/AppPageContentLayoutContext";

export type { AppPageContentLayout, AppPageContentMode };

export function createAppPageContentLayout(mode: AppPageContentMode): AppPageContentLayout {
  return {
    mode,
    isCompact: mode === "compact",
    isRegular: mode === "regular",
    isWide: mode === "wide",
  };
}

export function resolveAppPageContentMode(width: number, previousMode?: AppPageContentMode): AppPageContentMode {
  if (previousMode === "compact") {
    if (width > APP_PAGE_CONTENT_WIDE_ENTER_WIDTH) {
      return "wide";
    }

    return width > APP_PAGE_CONTENT_COMPACT_EXIT_WIDTH ? "regular" : "compact";
  }

  if (previousMode === "wide") {
    if (width < APP_PAGE_CONTENT_COMPACT_ENTER_WIDTH) {
      return "compact";
    }

    return width < APP_PAGE_CONTENT_WIDE_EXIT_WIDTH ? "regular" : "wide";
  }

  if (width < APP_PAGE_CONTENT_COMPACT_ENTER_WIDTH) {
    return "compact";
  }

  if (width > APP_PAGE_CONTENT_WIDE_ENTER_WIDTH) {
    return "wide";
  }

  return "regular";
}
