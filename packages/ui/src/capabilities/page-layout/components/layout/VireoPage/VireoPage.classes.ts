import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_PAGE_NAME, VIREO_PAGE_SLOTS, type VireoPageSlotName } from "./VireoPage.identity";

/** Utility classes available to VireoPage. */
export type VireoPageClasses = Record<VireoPageSlotName, string>;

/** Valid keys for VireoPage utility classes and theme style overrides. */
export type VireoPageClassKey = keyof VireoPageClasses;

/** Returns the generated utility class name for a VireoPage slot or state. */
export function getVireoPageUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_PAGE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoPage class key. */
export const vireoPageClasses: VireoPageClasses = generateUtilityClasses(VIREO_PAGE_NAME, [...VIREO_PAGE_SLOTS]);
