import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
  VIREO_FORM_SELECT_MULTIPLE_FIELD_SLOTS,
  VIREO_FORM_SELECT_MULTIPLE_FIELD_STATES,
  type VireoFormSelectMultipleFieldSlotName,
  type VireoFormSelectMultipleFieldStateName,
} from "./VireoFormSelectMultipleField.identity";

/** Utility classes available to VireoFormSelectMultipleField. */
export type VireoFormSelectMultipleFieldClasses = Record<
  VireoFormSelectMultipleFieldSlotName | VireoFormSelectMultipleFieldStateName,
  string
>;

/** Valid keys for VireoFormSelectMultipleField utility classes and theme style overrides. */
export type VireoFormSelectMultipleFieldClassKey = keyof VireoFormSelectMultipleFieldClasses;

/** Returns the generated utility class name for a VireoFormSelectMultipleField slot or state. */
export function getVireoFormSelectMultipleFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormSelectMultipleField class key. */
export const vireoFormSelectMultipleFieldClasses: VireoFormSelectMultipleFieldClasses = generateUtilityClasses(
  VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
  [...VIREO_FORM_SELECT_MULTIPLE_FIELD_SLOTS, ...VIREO_FORM_SELECT_MULTIPLE_FIELD_STATES],
);
