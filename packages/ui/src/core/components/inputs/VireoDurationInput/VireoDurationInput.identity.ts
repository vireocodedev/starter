import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoDurationInput integration point. */
export const VIREO_DURATION_INPUT_NAME = "VireoDurationInput";

/** Canonical public slots exposed by VireoDurationInput, in rendered DOM order. */
export const VIREO_DURATION_INPUT_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoDurationInput. */
export type VireoDurationInputSlotName = (typeof VIREO_DURATION_INPUT_SLOTS)[number];
