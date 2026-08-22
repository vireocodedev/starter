import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoTabs integration point. */
export const VIREO_TABS_NAME = "VireoTabs";

/** Canonical public slots exposed by VireoTabs, in rendered DOM order. */
export const VIREO_TABS_SLOTS = ["root", "tabs", "tab", "panel"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoTabs. */
export type VireoTabsSlotName = (typeof VIREO_TABS_SLOTS)[number];
