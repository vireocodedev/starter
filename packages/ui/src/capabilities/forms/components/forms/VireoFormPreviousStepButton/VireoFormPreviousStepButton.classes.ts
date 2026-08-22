import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME,
  VIREO_FORM_PREVIOUS_STEP_BUTTON_SLOTS,
  VIREO_FORM_PREVIOUS_STEP_BUTTON_STATES,
  type VireoFormPreviousStepButtonSlotName,
  type VireoFormPreviousStepButtonStateName,
} from "./VireoFormPreviousStepButton.identity";

/** Utility classes available to VireoFormPreviousStepButton. */
export type VireoFormPreviousStepButtonClasses = Record<
  VireoFormPreviousStepButtonSlotName | VireoFormPreviousStepButtonStateName,
  string
>;

/** Valid keys for VireoFormPreviousStepButton utility classes and theme style overrides. */
export type VireoFormPreviousStepButtonClassKey = keyof VireoFormPreviousStepButtonClasses;

/** Returns the generated utility class name for a VireoFormPreviousStepButton slot or state. */
export function getVireoFormPreviousStepButtonUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormPreviousStepButton class key. */
export const vireoFormPreviousStepButtonClasses: VireoFormPreviousStepButtonClasses = generateUtilityClasses(
  VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME,
  [...VIREO_FORM_PREVIOUS_STEP_BUTTON_SLOTS, ...VIREO_FORM_PREVIOUS_STEP_BUTTON_STATES],
);
