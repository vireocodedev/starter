import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_DURATION_INPUT_NAME,
  VIREO_DURATION_INPUT_SLOTS,
  type VireoDurationInputSlotName,
} from "./VireoDurationInput.identity";

/** Utility classes available to VireoDurationInput. */
export type VireoDurationInputClasses = Record<VireoDurationInputSlotName, string>;

/** Valid keys for VireoDurationInput utility classes and theme style overrides. */
export type VireoDurationInputClassKey = keyof VireoDurationInputClasses;

/** Returns the generated utility class name for a VireoDurationInput slot or state. */
export function getVireoDurationInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_DURATION_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoDurationInput class key. */
export const vireoDurationInputClasses: VireoDurationInputClasses = generateUtilityClasses(VIREO_DURATION_INPUT_NAME, [
  ...VIREO_DURATION_INPUT_SLOTS,
]);
