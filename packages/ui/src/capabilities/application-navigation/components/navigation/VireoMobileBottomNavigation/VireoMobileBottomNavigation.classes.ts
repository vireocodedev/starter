import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_MOBILE_BOTTOM_NAVIGATION_NAME,
  VIREO_MOBILE_BOTTOM_NAVIGATION_SLOTS,
  type VireoMobileBottomNavigationSlotName,
} from "./VireoMobileBottomNavigation.identity";

/** Utility classes available to VireoMobileBottomNavigation. */
export type VireoMobileBottomNavigationClasses = Record<VireoMobileBottomNavigationSlotName, string>;

/** Valid keys for VireoMobileBottomNavigation utility classes and theme style overrides. */
export type VireoMobileBottomNavigationClassKey = keyof VireoMobileBottomNavigationClasses;

/** Returns the generated utility class name for a VireoMobileBottomNavigation slot or state. */
export function getVireoMobileBottomNavigationUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_MOBILE_BOTTOM_NAVIGATION_NAME, slot);
}

/** Generated utility class names keyed by each public VireoMobileBottomNavigation class key. */
export const vireoMobileBottomNavigationClasses: VireoMobileBottomNavigationClasses = generateUtilityClasses(
  VIREO_MOBILE_BOTTOM_NAVIGATION_NAME,
  [...VIREO_MOBILE_BOTTOM_NAVIGATION_SLOTS],
);
