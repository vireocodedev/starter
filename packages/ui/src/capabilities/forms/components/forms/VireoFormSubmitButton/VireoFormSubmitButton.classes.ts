import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_SUBMIT_BUTTON_NAME,
  VIREO_FORM_SUBMIT_BUTTON_SLOTS,
  VIREO_FORM_SUBMIT_BUTTON_STATES,
  type VireoFormSubmitButtonSlotName,
  type VireoFormSubmitButtonStateName,
} from "./VireoFormSubmitButton.identity";

/** Utility classes available to VireoFormSubmitButton. */
export type VireoFormSubmitButtonClasses = Record<
  VireoFormSubmitButtonSlotName | VireoFormSubmitButtonStateName,
  string
>;

/** Valid keys for VireoFormSubmitButton utility classes and theme style overrides. */
export type VireoFormSubmitButtonClassKey = keyof VireoFormSubmitButtonClasses;

/** Returns the generated utility class name for a VireoFormSubmitButton slot or state. */
export function getVireoFormSubmitButtonUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_SUBMIT_BUTTON_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormSubmitButton class key. */
export const vireoFormSubmitButtonClasses: VireoFormSubmitButtonClasses = generateUtilityClasses(
  VIREO_FORM_SUBMIT_BUTTON_NAME,
  [...VIREO_FORM_SUBMIT_BUTTON_SLOTS, ...VIREO_FORM_SUBMIT_BUTTON_STATES],
);
