import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_TIME_INPUT_NAME, VIREO_TIME_INPUT_SLOTS, type VireoTimeInputSlotName } from "./VireoTimeInput.identity";

/** Utility classes available to VireoTimeInput. */
export type VireoTimeInputClasses = Record<VireoTimeInputSlotName, string>;

/** Valid keys for VireoTimeInput utility classes and theme style overrides. */
export type VireoTimeInputClassKey = keyof VireoTimeInputClasses;

/** Returns the generated utility class name for a VireoTimeInput slot or state. */
export function getVireoTimeInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_TIME_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoTimeInput class key. */
export const vireoTimeInputClasses: VireoTimeInputClasses = generateUtilityClasses(VIREO_TIME_INPUT_NAME, [
  ...VIREO_TIME_INPUT_SLOTS,
]);
