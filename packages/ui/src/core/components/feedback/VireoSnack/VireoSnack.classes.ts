import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_SNACK_NAME, VIREO_SNACK_SLOTS, type VireoSnackSlotName } from "./VireoSnack.identity";

/** Utility classes available to VireoSnack. */
export type VireoSnackClasses = Record<VireoSnackSlotName, string>;

/** Valid keys for VireoSnack utility classes and theme style overrides. */
export type VireoSnackClassKey = keyof VireoSnackClasses;

/** Returns the generated utility class name for a VireoSnack slot or state. */
export function getVireoSnackUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_SNACK_NAME, slot);
}

/** Generated utility class names keyed by each public VireoSnack class key. */
export const vireoSnackClasses: VireoSnackClasses = generateUtilityClasses(VIREO_SNACK_NAME, [...VIREO_SNACK_SLOTS]);
