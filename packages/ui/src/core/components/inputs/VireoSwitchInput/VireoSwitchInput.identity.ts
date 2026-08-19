import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoSwitchInput integration point. */
export const VIREO_SWITCH_INPUT_NAME = "VireoSwitchInput";

/** Canonical public slots exposed by VireoSwitchInput, in rendered DOM order. */
export const VIREO_SWITCH_INPUT_SLOTS = [
  "root",
  "control",
  "label",
  "helperText",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoSwitchInput. */
export type VireoSwitchInputSlotName = (typeof VIREO_SWITCH_INPUT_SLOTS)[number];
