import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoInitializationBoundary integration point. */
export const VIREO_INITIALIZATION_BOUNDARY_NAME = "VireoInitializationBoundary";

/** Canonical public slots exposed by VireoInitializationBoundary, in rendered DOM order. */
export const VIREO_INITIALIZATION_BOUNDARY_SLOTS = ["root", "loadingIndicator"] as const satisfies VireoSlotNameTuple;

/** Lifecycle state classes exposed by VireoInitializationBoundary. */
export const VIREO_INITIALIZATION_BOUNDARY_STATES = ["pending", "ready"] as const;

/** Public slot names exposed by VireoInitializationBoundary. */
export type VireoInitializationBoundarySlotName = (typeof VIREO_INITIALIZATION_BOUNDARY_SLOTS)[number];
