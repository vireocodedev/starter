import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_SLIDING_SCREEN_STACK_NAME,
  VIREO_SLIDING_SCREEN_STACK_SLOTS,
  type VireoSlidingScreenStackSlotName,
} from "./VireoSlidingScreenStack.identity";

/** Utility classes available to VireoSlidingScreenStack. */
export type VireoSlidingScreenStackClasses = Record<VireoSlidingScreenStackSlotName, string>;

/** Valid keys for VireoSlidingScreenStack utility classes and theme style overrides. */
export type VireoSlidingScreenStackClassKey = keyof VireoSlidingScreenStackClasses;

/** Returns the generated utility class name for a VireoSlidingScreenStack slot or state. */
export function getVireoSlidingScreenStackUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_SLIDING_SCREEN_STACK_NAME, slot);
}

/** Generated utility class names keyed by each public VireoSlidingScreenStack class key. */
export const vireoSlidingScreenStackClasses: VireoSlidingScreenStackClasses = generateUtilityClasses(
  VIREO_SLIDING_SCREEN_STACK_NAME,
  [...VIREO_SLIDING_SCREEN_STACK_SLOTS],
);
