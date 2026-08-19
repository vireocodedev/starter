import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoTimeInput integration point. */
export const VIREO_TIME_INPUT_NAME = "VireoTimeInput";

/** Canonical public slots exposed by VireoTimeInput, in rendered DOM order. */
export const VIREO_TIME_INPUT_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoTimeInput. */
export type VireoTimeInputSlotName = (typeof VIREO_TIME_INPUT_SLOTS)[number];
