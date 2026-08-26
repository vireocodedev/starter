import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoLoadingRegion integration point. */
export const VIREO_LOADING_REGION_NAME = "VireoLoadingRegion";

/** Canonical public slots exposed by VireoLoadingRegion, in rendered DOM order. */
export const VIREO_LOADING_REGION_SLOTS = ["root", "status"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoLoadingRegion. */
export type VireoLoadingRegionSlotName = (typeof VIREO_LOADING_REGION_SLOTS)[number];
