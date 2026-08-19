import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_SELECT_INPUT_NAME,
  VIREO_SELECT_INPUT_SLOTS,
  type VireoSelectInputSlotName,
} from "./VireoSelectInput.identity";

/** Utility classes available to VireoSelectInput. */
export type VireoSelectInputClasses = Record<VireoSelectInputSlotName, string>;

/** Valid keys for VireoSelectInput utility classes and theme style overrides. */
export type VireoSelectInputClassKey = keyof VireoSelectInputClasses;

/** Returns the generated utility class name for a VireoSelectInput slot or state. */
export function getVireoSelectInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_SELECT_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoSelectInput class key. */
export const vireoSelectInputClasses: VireoSelectInputClasses = generateUtilityClasses(VIREO_SELECT_INPUT_NAME, [
  ...VIREO_SELECT_INPUT_SLOTS,
]);
