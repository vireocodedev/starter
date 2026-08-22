import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_NAME,
  VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_SLOTS,
  VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_STATES,
  type VireoFormAutocompleteMultipleFieldSlotName,
  type VireoFormAutocompleteMultipleFieldStateName,
} from "./VireoFormAutocompleteMultipleField.identity";

/** Utility classes available to VireoFormAutocompleteMultipleField. */
export type VireoFormAutocompleteMultipleFieldClasses = Record<
  VireoFormAutocompleteMultipleFieldSlotName | VireoFormAutocompleteMultipleFieldStateName,
  string
>;

/** Valid keys for VireoFormAutocompleteMultipleField utility classes and theme style overrides. */
export type VireoFormAutocompleteMultipleFieldClassKey = keyof VireoFormAutocompleteMultipleFieldClasses;

/** Returns the generated utility class name for a VireoFormAutocompleteMultipleField slot or state. */
export function getVireoFormAutocompleteMultipleFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormAutocompleteMultipleField class key. */
export const vireoFormAutocompleteMultipleFieldClasses: VireoFormAutocompleteMultipleFieldClasses =
  generateUtilityClasses(VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_NAME, [
    ...VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_SLOTS,
    ...VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_STATES,
  ]);
