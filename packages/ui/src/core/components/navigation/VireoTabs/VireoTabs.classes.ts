import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_TABS_NAME, VIREO_TABS_SLOTS, type VireoTabsSlotName } from "./VireoTabs.identity";

/** Utility classes available to VireoTabs. */
export type VireoTabsClasses = Record<VireoTabsSlotName, string>;

/** Valid keys for VireoTabs utility classes and theme style overrides. */
export type VireoTabsClassKey = keyof VireoTabsClasses;

/** Returns the generated utility class name for a VireoTabs slot or state. */
export function getVireoTabsUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_TABS_NAME, slot);
}

/** Generated utility class names keyed by each public VireoTabs class key. */
export const vireoTabsClasses: VireoTabsClasses = generateUtilityClasses(VIREO_TABS_NAME, [...VIREO_TABS_SLOTS]);
