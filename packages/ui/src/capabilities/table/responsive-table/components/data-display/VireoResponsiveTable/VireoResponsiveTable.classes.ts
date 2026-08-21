import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_RESPONSIVE_TABLE_NAME,
  VIREO_RESPONSIVE_TABLE_SLOTS,
  type VireoResponsiveTableSlotName,
} from "./VireoResponsiveTable.identity";

/** Utility classes available to VireoResponsiveTable. */
export type VireoResponsiveTableClasses = Record<VireoResponsiveTableSlotName, string>;

/** Valid keys for VireoResponsiveTable utility classes and theme style overrides. */
export type VireoResponsiveTableClassKey = keyof VireoResponsiveTableClasses;

/** Returns the generated utility class name for a VireoResponsiveTable slot or state. */
export function getVireoResponsiveTableUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_RESPONSIVE_TABLE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoResponsiveTable class key. */
export const vireoResponsiveTableClasses: VireoResponsiveTableClasses = generateUtilityClasses(
  VIREO_RESPONSIVE_TABLE_NAME,
  [...VIREO_RESPONSIVE_TABLE_SLOTS],
);
