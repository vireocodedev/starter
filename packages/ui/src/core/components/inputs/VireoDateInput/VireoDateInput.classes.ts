import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_DATE_INPUT_NAME, VIREO_DATE_INPUT_SLOTS, type VireoDateInputSlotName } from "./VireoDateInput.identity";

/** Utility classes available to VireoDateInput. */
export type VireoDateInputClasses = Record<VireoDateInputSlotName, string>;

/** Valid keys for VireoDateInput utility classes and theme style overrides. */
export type VireoDateInputClassKey = keyof VireoDateInputClasses;

/** Returns the generated utility class name for a VireoDateInput slot or state. */
export function getVireoDateInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_DATE_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoDateInput class key. */
export const vireoDateInputClasses: VireoDateInputClasses = generateUtilityClasses(VIREO_DATE_INPUT_NAME, [
  ...VIREO_DATE_INPUT_SLOTS,
]);
