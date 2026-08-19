import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_SELECT_MULTIPLE_INPUT_NAME,
  VIREO_SELECT_MULTIPLE_INPUT_SLOTS,
  type VireoSelectMultipleInputSlotName,
} from "./VireoSelectMultipleInput.identity";

/** Utility classes available to VireoSelectMultipleInput. */
export type VireoSelectMultipleInputClasses = Record<VireoSelectMultipleInputSlotName, string>;

/** Valid keys for VireoSelectMultipleInput utility classes and theme style overrides. */
export type VireoSelectMultipleInputClassKey = keyof VireoSelectMultipleInputClasses;

/** Returns the generated utility class name for a VireoSelectMultipleInput slot or state. */
export function getVireoSelectMultipleInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_SELECT_MULTIPLE_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoSelectMultipleInput class key. */
export const vireoSelectMultipleInputClasses: VireoSelectMultipleInputClasses = generateUtilityClasses(
  VIREO_SELECT_MULTIPLE_INPUT_NAME,
  [...VIREO_SELECT_MULTIPLE_INPUT_SLOTS],
);
