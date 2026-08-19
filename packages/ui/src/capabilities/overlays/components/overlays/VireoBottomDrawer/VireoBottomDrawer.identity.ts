import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoBottomDrawer integration point. */
export const VIREO_BOTTOM_DRAWER_NAME = "VireoBottomDrawer";

/** Canonical public slots exposed by VireoBottomDrawer, in rendered DOM order. */
export const VIREO_BOTTOM_DRAWER_SLOTS = ["root", "puller"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoBottomDrawer. */
export type VireoBottomDrawerSlotName = (typeof VIREO_BOTTOM_DRAWER_SLOTS)[number];
