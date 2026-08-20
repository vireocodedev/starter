import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_CHECKBOX_FIELD_NAME,
  VIREO_FORM_CHECKBOX_FIELD_SLOTS,
  VIREO_FORM_CHECKBOX_FIELD_STATES,
  type VireoFormCheckboxFieldSlotName,
  type VireoFormCheckboxFieldStateName,
} from "./VireoFormCheckboxField.identity";

/** Utility classes available to VireoFormCheckboxField. */
export type VireoFormCheckboxFieldClasses = Record<
  VireoFormCheckboxFieldSlotName | VireoFormCheckboxFieldStateName,
  string
>;

/** Valid keys for VireoFormCheckboxField utility classes and theme style overrides. */
export type VireoFormCheckboxFieldClassKey = keyof VireoFormCheckboxFieldClasses;

/** Returns the generated utility class name for a VireoFormCheckboxField slot or state. */
export function getVireoFormCheckboxFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_CHECKBOX_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormCheckboxField class key. */
export const vireoFormCheckboxFieldClasses: VireoFormCheckboxFieldClasses = generateUtilityClasses(
  VIREO_FORM_CHECKBOX_FIELD_NAME,
  [...VIREO_FORM_CHECKBOX_FIELD_SLOTS, ...VIREO_FORM_CHECKBOX_FIELD_STATES],
);
