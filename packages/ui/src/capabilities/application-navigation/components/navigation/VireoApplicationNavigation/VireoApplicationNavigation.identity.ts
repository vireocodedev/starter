import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoApplicationNavigation integration point. */
export const VIREO_APPLICATION_NAVIGATION_NAME = "VireoApplicationNavigation";

/** Canonical public slots exposed by VireoApplicationNavigation, in rendered DOM order. */
export const VIREO_APPLICATION_NAVIGATION_SLOTS = [
  "root",
  "surface",
  "content",
  "resizeHandle",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoApplicationNavigation. */
export type VireoApplicationNavigationSlotName = (typeof VIREO_APPLICATION_NAVIGATION_SLOTS)[number];
