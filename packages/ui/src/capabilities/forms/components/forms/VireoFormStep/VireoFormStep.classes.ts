import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_FORM_STEP_NAME, VIREO_FORM_STEP_SLOTS, type VireoFormStepSlotName } from "./VireoFormStep.identity";

/** Utility classes available to VireoFormStep. */
export type VireoFormStepClasses = Record<VireoFormStepSlotName, string>;

/** Valid keys for VireoFormStep utility classes and theme style overrides. */
export type VireoFormStepClassKey = keyof VireoFormStepClasses;

/** Returns the generated utility class name for a VireoFormStep slot or state. */
export function getVireoFormStepUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_STEP_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormStep class key. */
export const vireoFormStepClasses: VireoFormStepClasses = generateUtilityClasses(VIREO_FORM_STEP_NAME, [
  ...VIREO_FORM_STEP_SLOTS,
]);
