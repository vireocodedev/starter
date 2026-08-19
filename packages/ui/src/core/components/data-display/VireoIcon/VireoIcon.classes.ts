import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_ICON_NAME, VIREO_ICON_SLOTS, type VireoIconSlotName } from "./VireoIcon.identity";

/** Utility classes available to VireoIcon. */
export type VireoIconClasses = Record<VireoIconSlotName, string>;

/** Valid keys for VireoIcon utility classes and theme style overrides. */
export type VireoIconClassKey = keyof VireoIconClasses;

/** Returns the generated utility class name for a VireoIcon slot or state. */
export function getVireoIconUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_ICON_NAME, slot);
}

/** Generated utility class names keyed by each public VireoIcon class key. */
export const vireoIconClasses: VireoIconClasses = generateUtilityClasses(VIREO_ICON_NAME, [...VIREO_ICON_SLOTS]);
