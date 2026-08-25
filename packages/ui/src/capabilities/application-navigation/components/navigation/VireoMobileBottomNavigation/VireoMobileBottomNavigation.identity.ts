import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoMobileBottomNavigation integration point. */
export const VIREO_MOBILE_BOTTOM_NAVIGATION_NAME = "VireoMobileBottomNavigation";

/** Canonical public slots exposed by VireoMobileBottomNavigation, in rendered DOM order. */
export const VIREO_MOBILE_BOTTOM_NAVIGATION_SLOTS = [
  "root",
  "navigation",
  "action",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoMobileBottomNavigation. */
export type VireoMobileBottomNavigationSlotName = (typeof VIREO_MOBILE_BOTTOM_NAVIGATION_SLOTS)[number];
