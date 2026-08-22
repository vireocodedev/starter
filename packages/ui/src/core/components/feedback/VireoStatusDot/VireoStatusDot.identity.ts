import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoStatusDot integration point. */
export const VIREO_STATUS_DOT_NAME = "VireoStatusDot";

/** Canonical public slots exposed by VireoStatusDot, in rendered DOM order. */
export const VIREO_STATUS_DOT_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoStatusDot. */
export type VireoStatusDotSlotName = (typeof VIREO_STATUS_DOT_SLOTS)[number];
