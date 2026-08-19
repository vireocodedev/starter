import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_ICON_CONTAINER_NAME,
  VIREO_ICON_CONTAINER_SLOTS,
  type VireoIconContainerSlotName,
} from "./VireoIconContainer.identity";

/** Utility classes available to VireoIconContainer. */
export type VireoIconContainerClasses = Record<VireoIconContainerSlotName, string>;

/** Valid keys for VireoIconContainer utility classes and theme style overrides. */
export type VireoIconContainerClassKey = keyof VireoIconContainerClasses;

/** Returns the generated utility class name for a VireoIconContainer slot or state. */
export function getVireoIconContainerUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_ICON_CONTAINER_NAME, slot);
}

/** Generated utility class names keyed by each public VireoIconContainer class key. */
export const vireoIconContainerClasses: VireoIconContainerClasses = generateUtilityClasses(VIREO_ICON_CONTAINER_NAME, [
  ...VIREO_ICON_CONTAINER_SLOTS,
]);
