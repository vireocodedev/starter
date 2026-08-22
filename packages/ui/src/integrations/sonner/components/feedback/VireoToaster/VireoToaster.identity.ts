import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoToaster integration point. */
export const VIREO_TOASTER_NAME = "VireoToaster";

/** Canonical public slots exposed by VireoToaster, in rendered DOM order. */
export const VIREO_TOASTER_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoToaster. */
export type VireoToasterSlotName = (typeof VIREO_TOASTER_SLOTS)[number];
