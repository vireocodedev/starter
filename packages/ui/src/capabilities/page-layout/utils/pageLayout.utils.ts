import {
  VIREO_PAGE_LAYOUT_COMPACT_ENTER_WIDTH,
  VIREO_PAGE_LAYOUT_COMPACT_EXIT_WIDTH,
  VIREO_PAGE_LAYOUT_WIDE_ENTER_WIDTH,
  VIREO_PAGE_LAYOUT_WIDE_EXIT_WIDTH,
} from "@/capabilities/page-layout/constants/pageLayout.constants";
import type { VireoPageLayout, VireoPageLayoutMode } from "@/capabilities/page-layout/types/pageLayout.types";

export function createVireoPageLayout(mode: VireoPageLayoutMode): VireoPageLayout {
  return { mode, isCompact: mode === "compact", isRegular: mode === "regular", isWide: mode === "wide" };
}

/** Resolves a stable container mode with hysteresis around compact and wide boundaries. */
export function resolveVireoPageLayoutMode(width: number, previousMode?: VireoPageLayoutMode): VireoPageLayoutMode {
  if (previousMode === "compact") {
    if (width > VIREO_PAGE_LAYOUT_WIDE_ENTER_WIDTH) return "wide";
    return width > VIREO_PAGE_LAYOUT_COMPACT_EXIT_WIDTH ? "regular" : "compact";
  }
  if (previousMode === "wide") {
    if (width < VIREO_PAGE_LAYOUT_COMPACT_ENTER_WIDTH) return "compact";
    return width < VIREO_PAGE_LAYOUT_WIDE_EXIT_WIDTH ? "regular" : "wide";
  }
  if (width < VIREO_PAGE_LAYOUT_COMPACT_ENTER_WIDTH) return "compact";
  if (width > VIREO_PAGE_LAYOUT_WIDE_ENTER_WIDTH) return "wide";
  return "regular";
}
