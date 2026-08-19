import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoSelectMultipleInput integration point. */
export const VIREO_SELECT_MULTIPLE_INPUT_NAME = "VireoSelectMultipleInput";

/** Canonical public slots exposed by VireoSelectMultipleInput, in rendered DOM order. */
export const VIREO_SELECT_MULTIPLE_INPUT_SLOTS = [
  "root",
  "label",
  "select",
  "option",
  "optionText",
  "helperText",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoSelectMultipleInput. */
export type VireoSelectMultipleInputSlotName = (typeof VIREO_SELECT_MULTIPLE_INPUT_SLOTS)[number];
