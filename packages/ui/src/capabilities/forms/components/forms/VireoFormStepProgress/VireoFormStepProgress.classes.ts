import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_STEP_PROGRESS_NAME,
  VIREO_FORM_STEP_PROGRESS_SLOTS,
  type VireoFormStepProgressSlotName,
} from "./VireoFormStepProgress.identity";

/** Utility classes available to VireoFormStepProgress. */
export type VireoFormStepProgressClasses = Record<VireoFormStepProgressSlotName, string>;

/** Valid keys for VireoFormStepProgress utility classes and theme style overrides. */
export type VireoFormStepProgressClassKey = keyof VireoFormStepProgressClasses;

/** Returns the generated utility class name for a VireoFormStepProgress slot or state. */
export function getVireoFormStepProgressUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_STEP_PROGRESS_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormStepProgress class key. */
export const vireoFormStepProgressClasses: VireoFormStepProgressClasses = generateUtilityClasses(
  VIREO_FORM_STEP_PROGRESS_NAME,
  [...VIREO_FORM_STEP_PROGRESS_SLOTS],
);
