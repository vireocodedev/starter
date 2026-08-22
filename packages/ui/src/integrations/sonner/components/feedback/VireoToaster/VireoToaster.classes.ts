import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_TOASTER_NAME, VIREO_TOASTER_SLOTS, type VireoToasterSlotName } from "./VireoToaster.identity";

/** Utility classes available to VireoToaster. */
export type VireoToasterClasses = Record<VireoToasterSlotName, string>;

/** Valid keys for VireoToaster utility classes and theme style overrides. */
export type VireoToasterClassKey = keyof VireoToasterClasses;

/** Returns the generated utility class name for a VireoToaster slot or state. */
export function getVireoToasterUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_TOASTER_NAME, slot);
}

/** Generated utility class names keyed by each public VireoToaster class key. */
export const vireoToasterClasses: VireoToasterClasses = generateUtilityClasses(VIREO_TOASTER_NAME, [
  ...VIREO_TOASTER_SLOTS,
]);
