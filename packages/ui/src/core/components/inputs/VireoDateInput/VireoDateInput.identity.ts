import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoDateInput integration point. */
export const VIREO_DATE_INPUT_NAME = "VireoDateInput";

/** Canonical public slots exposed by VireoDateInput, in rendered DOM order. */
export const VIREO_DATE_INPUT_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoDateInput. */
export type VireoDateInputSlotName = (typeof VIREO_DATE_INPUT_SLOTS)[number];
