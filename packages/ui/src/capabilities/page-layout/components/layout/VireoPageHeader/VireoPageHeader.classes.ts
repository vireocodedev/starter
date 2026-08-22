import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_PAGE_HEADER_NAME,
  VIREO_PAGE_HEADER_SLOTS,
  type VireoPageHeaderSlotName,
} from "./VireoPageHeader.identity";

/** Utility classes available to VireoPageHeader. */
export type VireoPageHeaderClasses = Record<VireoPageHeaderSlotName, string>;

/** Valid keys for VireoPageHeader utility classes and theme style overrides. */
export type VireoPageHeaderClassKey = keyof VireoPageHeaderClasses;

/** Returns the generated utility class name for a VireoPageHeader slot or state. */
export function getVireoPageHeaderUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_PAGE_HEADER_NAME, slot);
}

/** Generated utility class names keyed by each public VireoPageHeader class key. */
export const vireoPageHeaderClasses: VireoPageHeaderClasses = generateUtilityClasses(VIREO_PAGE_HEADER_NAME, [
  ...VIREO_PAGE_HEADER_SLOTS,
]);
