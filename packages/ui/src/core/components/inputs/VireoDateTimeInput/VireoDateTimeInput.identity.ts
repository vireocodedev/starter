import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoDateTimeInput integration point. */
export const VIREO_DATE_TIME_INPUT_NAME = "VireoDateTimeInput";

/** Canonical public slots exposed by VireoDateTimeInput, in rendered DOM order. */
export const VIREO_DATE_TIME_INPUT_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoDateTimeInput. */
export type VireoDateTimeInputSlotName = (typeof VIREO_DATE_TIME_INPUT_SLOTS)[number];
