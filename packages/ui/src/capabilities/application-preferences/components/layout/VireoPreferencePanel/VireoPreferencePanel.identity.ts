import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoPreferencePanel integration point. */
export const VIREO_PREFERENCE_PANEL_NAME = "VireoPreferencePanel";

/** Canonical public slots exposed by VireoPreferencePanel, in rendered DOM order. */
export const VIREO_PREFERENCE_PANEL_SLOTS = [
  "root",
  "section",
  "sectionHeader",
  "sectionSummary",
  "sectionAction",
  "sectionDetails",
  "item",
  "itemIcon",
  "itemContent",
  "itemTitle",
  "itemDescription",
  "itemControl",
  "emptyState",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoPreferencePanel. */
export type VireoPreferencePanelSlotName = (typeof VIREO_PREFERENCE_PANEL_SLOTS)[number];
