import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_MULTI_STEP_NAME,
  VIREO_FORM_MULTI_STEP_SLOTS,
  type VireoFormMultiStepSlotName,
} from "./VireoFormMultiStep.identity";

/** Utility classes available to VireoFormMultiStep. */
export type VireoFormMultiStepClasses = Record<VireoFormMultiStepSlotName, string>;

/** Valid keys for VireoFormMultiStep utility classes and theme style overrides. */
export type VireoFormMultiStepClassKey = keyof VireoFormMultiStepClasses;

/** Returns the generated utility class name for a VireoFormMultiStep slot or state. */
export function getVireoFormMultiStepUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_MULTI_STEP_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormMultiStep class key. */
export const vireoFormMultiStepClasses: VireoFormMultiStepClasses = generateUtilityClasses(VIREO_FORM_MULTI_STEP_NAME, [
  ...VIREO_FORM_MULTI_STEP_SLOTS,
]);
