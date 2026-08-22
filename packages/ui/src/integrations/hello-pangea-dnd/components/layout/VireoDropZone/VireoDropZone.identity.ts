import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoDropZone integration point. */
export const VIREO_DROP_ZONE_NAME = "VireoDropZone";

/** Canonical public slots exposed by VireoDropZone, in rendered DOM order. */
export const VIREO_DROP_ZONE_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoDropZone. */
export type VireoDropZoneSlotName = (typeof VIREO_DROP_ZONE_SLOTS)[number];
