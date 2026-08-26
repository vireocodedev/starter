import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_SKELETON_NAME, VIREO_SKELETON_SLOTS, type VireoSkeletonSlotName } from "./VireoSkeleton.identity";

/** Utility classes available to VireoSkeleton. */
export type VireoSkeletonClasses = Record<VireoSkeletonSlotName, string>;

/** Valid keys for VireoSkeleton utility classes and theme style overrides. */
export type VireoSkeletonClassKey = keyof VireoSkeletonClasses;

/** Returns the generated utility class name for a VireoSkeleton slot or state. */
export function getVireoSkeletonUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_SKELETON_NAME, slot);
}

/** Generated utility class names keyed by each public VireoSkeleton class key. */
export const vireoSkeletonClasses: VireoSkeletonClasses = generateUtilityClasses(VIREO_SKELETON_NAME, [
  ...VIREO_SKELETON_SLOTS,
]);
