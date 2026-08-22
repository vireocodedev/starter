import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoDockedSidePanel integration point. */
export const VIREO_DOCKED_SIDE_PANEL_NAME = "VireoDockedSidePanel";

/** Canonical public slots exposed by VireoDockedSidePanel, in rendered DOM order. */
export const VIREO_DOCKED_SIDE_PANEL_SLOTS = ["root", "surface"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoDockedSidePanel. */
export type VireoDockedSidePanelSlotName = (typeof VIREO_DOCKED_SIDE_PANEL_SLOTS)[number];
