import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoResponsiveFormOverlay integration point. */
export const VIREO_RESPONSIVE_FORM_OVERLAY_NAME = "VireoResponsiveFormOverlay";

/** Canonical public slots exposed by VireoResponsiveFormOverlay, in rendered DOM order. */
export const VIREO_RESPONSIVE_FORM_OVERLAY_SLOTS = [
  "root",
  "header",
  "content",
  "actions",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoResponsiveFormOverlay. */
export type VireoResponsiveFormOverlaySlotName = (typeof VIREO_RESPONSIVE_FORM_OVERLAY_SLOTS)[number];
