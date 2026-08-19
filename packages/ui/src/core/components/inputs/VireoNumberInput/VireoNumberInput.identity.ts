import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoNumberInput integration point. */
export const VIREO_NUMBER_INPUT_NAME = "VireoNumberInput";

/** Canonical public slots exposed by VireoNumberInput, in rendered DOM order. */
export const VIREO_NUMBER_INPUT_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoNumberInput. */
export type VireoNumberInputSlotName = (typeof VIREO_NUMBER_INPUT_SLOTS)[number];
