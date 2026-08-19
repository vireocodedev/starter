import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_NUMBER_INPUT_NAME,
  VIREO_NUMBER_INPUT_SLOTS,
  type VireoNumberInputSlotName,
} from "./VireoNumberInput.identity";

/** Utility classes available to VireoNumberInput. */
export type VireoNumberInputClasses = Record<VireoNumberInputSlotName, string>;

/** Valid keys for VireoNumberInput utility classes and theme style overrides. */
export type VireoNumberInputClassKey = keyof VireoNumberInputClasses;

/** Returns the generated utility class name for a VireoNumberInput slot or state. */
export function getVireoNumberInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_NUMBER_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoNumberInput class key. */
export const vireoNumberInputClasses: VireoNumberInputClasses = generateUtilityClasses(VIREO_NUMBER_INPUT_NAME, [
  ...VIREO_NUMBER_INPUT_SLOTS,
]);
