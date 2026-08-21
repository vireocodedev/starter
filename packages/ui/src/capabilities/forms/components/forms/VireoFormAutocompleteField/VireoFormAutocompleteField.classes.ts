import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_AUTOCOMPLETE_FIELD_NAME,
  VIREO_FORM_AUTOCOMPLETE_FIELD_SLOTS,
  VIREO_FORM_AUTOCOMPLETE_FIELD_STATES,
  type VireoFormAutocompleteFieldSlotName,
  type VireoFormAutocompleteFieldStateName,
} from "./VireoFormAutocompleteField.identity";

/** Utility classes available to VireoFormAutocompleteField. */
export type VireoFormAutocompleteFieldClasses = Record<
  VireoFormAutocompleteFieldSlotName | VireoFormAutocompleteFieldStateName,
  string
>;

/** Valid keys for VireoFormAutocompleteField utility classes and theme style overrides. */
export type VireoFormAutocompleteFieldClassKey = keyof VireoFormAutocompleteFieldClasses;

/** Returns the generated utility class name for a VireoFormAutocompleteField slot or state. */
export function getVireoFormAutocompleteFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_AUTOCOMPLETE_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormAutocompleteField class key. */
export const vireoFormAutocompleteFieldClasses: VireoFormAutocompleteFieldClasses = generateUtilityClasses(
  VIREO_FORM_AUTOCOMPLETE_FIELD_NAME,
  [...VIREO_FORM_AUTOCOMPLETE_FIELD_SLOTS, ...VIREO_FORM_AUTOCOMPLETE_FIELD_STATES],
);
