import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_DATE_TIME_INPUT_NAME,
  VIREO_DATE_TIME_INPUT_SLOTS,
  type VireoDateTimeInputSlotName,
} from "./VireoDateTimeInput.identity";

/** Utility classes available to VireoDateTimeInput. */
export type VireoDateTimeInputClasses = Record<VireoDateTimeInputSlotName, string>;

/** Valid keys for VireoDateTimeInput utility classes and theme style overrides. */
export type VireoDateTimeInputClassKey = keyof VireoDateTimeInputClasses;

/** Returns the generated utility class name for a VireoDateTimeInput slot or state. */
export function getVireoDateTimeInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_DATE_TIME_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoDateTimeInput class key. */
export const vireoDateTimeInputClasses: VireoDateTimeInputClasses = generateUtilityClasses(VIREO_DATE_TIME_INPUT_NAME, [
  ...VIREO_DATE_TIME_INPUT_SLOTS,
]);
