import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_BOTTOM_DRAWER_NAME,
  VIREO_BOTTOM_DRAWER_SLOTS,
  type VireoBottomDrawerSlotName,
} from "./VireoBottomDrawer.identity";

/** Utility classes available to VireoBottomDrawer. */
export type VireoBottomDrawerClasses = Record<VireoBottomDrawerSlotName, string>;

/** Valid keys for VireoBottomDrawer utility classes and theme style overrides. */
export type VireoBottomDrawerClassKey = keyof VireoBottomDrawerClasses;

/** Returns the generated utility class name for a VireoBottomDrawer slot or state. */
export function getVireoBottomDrawerUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_BOTTOM_DRAWER_NAME, slot);
}

/** Generated utility class names keyed by each public VireoBottomDrawer class key. */
export const vireoBottomDrawerClasses: VireoBottomDrawerClasses = generateUtilityClasses(VIREO_BOTTOM_DRAWER_NAME, [
  ...VIREO_BOTTOM_DRAWER_SLOTS,
]);
