import type { VireoSlotNameTuple } from "@/utils/muiutils";

/** Stable component name shared by every VireoOverlayHeader integration point. */
export const VIREO_OVERLAY_HEADER_NAME = "VireoOverlayHeader";

/** Canonical public slots exposed by VireoOverlayHeader, in rendered DOM order. */
export const VIREO_OVERLAY_HEADER_SLOTS = [
  "root",
  "leadingAction",
  "title",
  "actions",
  "closeButton",
  "closeIcon",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoOverlayHeader. */
export type VireoOverlayHeaderSlotName = (typeof VIREO_OVERLAY_HEADER_SLOTS)[number];
