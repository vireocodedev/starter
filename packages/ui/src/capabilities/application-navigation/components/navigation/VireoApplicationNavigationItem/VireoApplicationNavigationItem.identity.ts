import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoApplicationNavigationItem integration point. */
export const VIREO_APPLICATION_NAVIGATION_ITEM_NAME = "VireoApplicationNavigationItem";

/** Canonical public slots exposed by VireoApplicationNavigationItem, in rendered DOM order. */
export const VIREO_APPLICATION_NAVIGATION_ITEM_SLOTS = ["root", "icon", "label"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoApplicationNavigationItem. */
export type VireoApplicationNavigationItemSlotName = (typeof VIREO_APPLICATION_NAVIGATION_ITEM_SLOTS)[number];
