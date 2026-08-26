import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoSkeleton integration point. */
export const VIREO_SKELETON_NAME = "VireoSkeleton";

/** Canonical public slots exposed by VireoSkeleton, in rendered DOM order. */
export const VIREO_SKELETON_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoSkeleton. */
export type VireoSkeletonSlotName = (typeof VIREO_SKELETON_SLOTS)[number];
