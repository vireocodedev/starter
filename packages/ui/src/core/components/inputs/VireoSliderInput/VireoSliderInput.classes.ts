import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_SLIDER_INPUT_NAME,
  VIREO_SLIDER_INPUT_SLOTS,
  type VireoSliderInputSlotName,
} from "./VireoSliderInput.identity";

/** Utility classes available to VireoSliderInput. */
export type VireoSliderInputClasses = Record<VireoSliderInputSlotName, string>;

/** Valid keys for VireoSliderInput utility classes and theme style overrides. */
export type VireoSliderInputClassKey = keyof VireoSliderInputClasses;

/** Returns the generated utility class name for a VireoSliderInput slot or state. */
export function getVireoSliderInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_SLIDER_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoSliderInput class key. */
export const vireoSliderInputClasses: VireoSliderInputClasses = generateUtilityClasses(VIREO_SLIDER_INPUT_NAME, [
  ...VIREO_SLIDER_INPUT_SLOTS,
]);
