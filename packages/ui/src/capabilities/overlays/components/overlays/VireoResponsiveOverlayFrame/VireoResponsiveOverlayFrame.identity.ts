import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoResponsiveOverlayFrame integration point. */
export const VIREO_RESPONSIVE_OVERLAY_FRAME_NAME = "VireoResponsiveOverlayFrame";

/** Canonical public slots exposed by VireoResponsiveOverlayFrame, in rendered DOM order. */
export const VIREO_RESPONSIVE_OVERLAY_FRAME_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoResponsiveOverlayFrame. */
export type VireoResponsiveOverlayFrameSlotName = (typeof VIREO_RESPONSIVE_OVERLAY_FRAME_SLOTS)[number];
