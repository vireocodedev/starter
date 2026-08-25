import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_APPLICATION_NAVIGATION_NAME,
  VIREO_APPLICATION_NAVIGATION_SLOTS,
  type VireoApplicationNavigationSlotName,
} from "./VireoApplicationNavigation.identity";

/** Utility classes available to VireoApplicationNavigation. */
export type VireoApplicationNavigationClasses = Record<VireoApplicationNavigationSlotName, string>;

/** Valid keys for VireoApplicationNavigation utility classes and theme style overrides. */
export type VireoApplicationNavigationClassKey = keyof VireoApplicationNavigationClasses;

/** Returns the generated utility class name for a VireoApplicationNavigation slot or state. */
export function getVireoApplicationNavigationUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_APPLICATION_NAVIGATION_NAME, slot);
}

/** Generated utility class names keyed by each public VireoApplicationNavigation class key. */
export const vireoApplicationNavigationClasses: VireoApplicationNavigationClasses = generateUtilityClasses(
  VIREO_APPLICATION_NAVIGATION_NAME,
  [...VIREO_APPLICATION_NAVIGATION_SLOTS],
);
