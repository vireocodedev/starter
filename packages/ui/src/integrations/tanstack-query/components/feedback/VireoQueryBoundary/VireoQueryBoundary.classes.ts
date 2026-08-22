import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_QUERY_BOUNDARY_NAME,
  VIREO_QUERY_BOUNDARY_SLOTS,
  type VireoQueryBoundarySlotName,
} from "./VireoQueryBoundary.identity";

/** Utility classes available to VireoQueryBoundary. */
export type VireoQueryBoundaryClasses = Record<
  VireoQueryBoundarySlotName | "loading" | "error" | "hasErrorDetails",
  string
>;

/** Valid keys for VireoQueryBoundary utility classes and theme style overrides. */
export type VireoQueryBoundaryClassKey = keyof VireoQueryBoundaryClasses;

/** Returns the generated utility class name for a VireoQueryBoundary slot or state. */
export function getVireoQueryBoundaryUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_QUERY_BOUNDARY_NAME, slot);
}

/** Generated utility class names keyed by each public VireoQueryBoundary class key. */
export const vireoQueryBoundaryClasses: VireoQueryBoundaryClasses = generateUtilityClasses(VIREO_QUERY_BOUNDARY_NAME, [
  ...VIREO_QUERY_BOUNDARY_SLOTS,
  "loading",
  "error",
  "hasErrorDetails",
]);
