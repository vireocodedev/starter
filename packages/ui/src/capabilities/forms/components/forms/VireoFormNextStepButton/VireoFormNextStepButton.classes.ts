import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_NEXT_STEP_BUTTON_NAME,
  VIREO_FORM_NEXT_STEP_BUTTON_SLOTS,
  VIREO_FORM_NEXT_STEP_BUTTON_STATES,
  type VireoFormNextStepButtonSlotName,
  type VireoFormNextStepButtonStateName,
} from "./VireoFormNextStepButton.identity";

/** Utility classes available to VireoFormNextStepButton. */
export type VireoFormNextStepButtonClasses = Record<
  VireoFormNextStepButtonSlotName | VireoFormNextStepButtonStateName,
  string
>;

/** Valid keys for VireoFormNextStepButton utility classes and theme style overrides. */
export type VireoFormNextStepButtonClassKey = keyof VireoFormNextStepButtonClasses;

/** Returns the generated utility class name for a VireoFormNextStepButton slot or state. */
export function getVireoFormNextStepButtonUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_NEXT_STEP_BUTTON_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormNextStepButton class key. */
export const vireoFormNextStepButtonClasses: VireoFormNextStepButtonClasses = generateUtilityClasses(
  VIREO_FORM_NEXT_STEP_BUTTON_NAME,
  [...VIREO_FORM_NEXT_STEP_BUTTON_SLOTS, ...VIREO_FORM_NEXT_STEP_BUTTON_STATES],
);
