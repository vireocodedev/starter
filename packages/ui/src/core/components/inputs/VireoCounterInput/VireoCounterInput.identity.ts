import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoCounterInput integration point. */
export const VIREO_COUNTER_INPUT_NAME = "VireoCounterInput";

/** Canonical public slots exposed by VireoCounterInput, in rendered DOM order. */
export const VIREO_COUNTER_INPUT_SLOTS = [
  "root",
  "decrementButton",
  "incrementButton",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoCounterInput. */
export type VireoCounterInputSlotName = (typeof VIREO_COUNTER_INPUT_SLOTS)[number];
