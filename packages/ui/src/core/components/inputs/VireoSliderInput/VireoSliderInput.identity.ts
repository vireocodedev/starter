import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoSliderInput integration point. */
export const VIREO_SLIDER_INPUT_NAME = "VireoSliderInput";

/** Canonical public slots exposed by VireoSliderInput, in rendered DOM order. */
export const VIREO_SLIDER_INPUT_SLOTS = [
  "root",
  "sliderIcon",
  "slider",
  "numberInput",
  "helperText",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoSliderInput. */
export type VireoSliderInputSlotName = (typeof VIREO_SLIDER_INPUT_SLOTS)[number];
