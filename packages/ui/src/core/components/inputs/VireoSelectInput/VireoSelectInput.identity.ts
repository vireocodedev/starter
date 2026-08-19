import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoSelectInput integration point. */
export const VIREO_SELECT_INPUT_NAME = "VireoSelectInput";

/** Canonical public slots exposed by VireoSelectInput, in rendered DOM order. */
export const VIREO_SELECT_INPUT_SLOTS = [
  "root",
  "label",
  "select",
  "option",
  "optionText",
  "clearButton",
  "helperText",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoSelectInput. */
export type VireoSelectInputSlotName = (typeof VIREO_SELECT_INPUT_SLOTS)[number];
