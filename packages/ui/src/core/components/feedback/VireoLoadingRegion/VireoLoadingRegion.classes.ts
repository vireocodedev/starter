import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_LOADING_REGION_NAME,
  VIREO_LOADING_REGION_SLOTS,
  type VireoLoadingRegionSlotName,
} from "./VireoLoadingRegion.identity";

/** Utility classes available to VireoLoadingRegion. */
export type VireoLoadingRegionStateClassKey = "loading" | "loadingVisible";

export type VireoLoadingRegionClasses = Record<VireoLoadingRegionSlotName | VireoLoadingRegionStateClassKey, string>;

/** Valid keys for VireoLoadingRegion utility classes and theme style overrides. */
export type VireoLoadingRegionClassKey = keyof VireoLoadingRegionClasses;

/** Returns the generated utility class name for a VireoLoadingRegion slot or state. */
export function getVireoLoadingRegionUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_LOADING_REGION_NAME, slot);
}

/** Generated utility class names keyed by each public VireoLoadingRegion class key. */
export const vireoLoadingRegionClasses: VireoLoadingRegionClasses = generateUtilityClasses(VIREO_LOADING_REGION_NAME, [
  ...VIREO_LOADING_REGION_SLOTS,
  "loading",
  "loadingVisible",
]);
