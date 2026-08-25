import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_APPLICATION_NAVIGATION_ITEM_NAME,
  VIREO_APPLICATION_NAVIGATION_ITEM_SLOTS,
  type VireoApplicationNavigationItemSlotName,
} from "./VireoApplicationNavigationItem.identity";

/** Utility classes available to VireoApplicationNavigationItem. */
export type VireoApplicationNavigationItemClasses = Record<VireoApplicationNavigationItemSlotName, string>;

/** Valid keys for VireoApplicationNavigationItem utility classes and theme style overrides. */
export type VireoApplicationNavigationItemClassKey = keyof VireoApplicationNavigationItemClasses;

/** Returns the generated utility class name for a VireoApplicationNavigationItem slot or state. */
export function getVireoApplicationNavigationItemUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_APPLICATION_NAVIGATION_ITEM_NAME, slot);
}

/** Generated utility class names keyed by each public VireoApplicationNavigationItem class key. */
export const vireoApplicationNavigationItemClasses: VireoApplicationNavigationItemClasses = generateUtilityClasses(
  VIREO_APPLICATION_NAVIGATION_ITEM_NAME,
  [...VIREO_APPLICATION_NAVIGATION_ITEM_SLOTS],
);
