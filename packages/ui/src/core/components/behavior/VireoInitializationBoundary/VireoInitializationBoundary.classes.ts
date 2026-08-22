import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_INITIALIZATION_BOUNDARY_NAME,
  VIREO_INITIALIZATION_BOUNDARY_SLOTS,
  VIREO_INITIALIZATION_BOUNDARY_STATES,
  type VireoInitializationBoundarySlotName,
} from "./VireoInitializationBoundary.identity";

/** Utility classes available to VireoInitializationBoundary. */
export type VireoInitializationBoundaryStateClassKey = (typeof VIREO_INITIALIZATION_BOUNDARY_STATES)[number];

export type VireoInitializationBoundaryClasses = Record<
  VireoInitializationBoundarySlotName | VireoInitializationBoundaryStateClassKey,
  string
>;

/** Valid keys for VireoInitializationBoundary utility classes and theme style overrides. */
export type VireoInitializationBoundaryClassKey = keyof VireoInitializationBoundaryClasses;

/** Returns the generated utility class name for a VireoInitializationBoundary slot or state. */
export function getVireoInitializationBoundaryUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_INITIALIZATION_BOUNDARY_NAME, slot);
}

/** Generated utility class names keyed by each public VireoInitializationBoundary class key. */
export const vireoInitializationBoundaryClasses: VireoInitializationBoundaryClasses = generateUtilityClasses(
  VIREO_INITIALIZATION_BOUNDARY_NAME,
  [...VIREO_INITIALIZATION_BOUNDARY_SLOTS, ...VIREO_INITIALIZATION_BOUNDARY_STATES],
);
