import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME,
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_SLOTS,
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_STATES,
  type VireoFormFreeSoloAutocompleteMultipleFieldSlotName,
  type VireoFormFreeSoloAutocompleteMultipleFieldStateName,
} from "./VireoFormFreeSoloAutocompleteMultipleField.identity";

/** Utility classes available to VireoFormFreeSoloAutocompleteMultipleField. */
export type VireoFormFreeSoloAutocompleteMultipleFieldClasses = Record<
  VireoFormFreeSoloAutocompleteMultipleFieldSlotName | VireoFormFreeSoloAutocompleteMultipleFieldStateName,
  string
>;

/** Valid keys for VireoFormFreeSoloAutocompleteMultipleField utility classes and theme style overrides. */
export type VireoFormFreeSoloAutocompleteMultipleFieldClassKey =
  keyof VireoFormFreeSoloAutocompleteMultipleFieldClasses;

/** Returns the generated utility class name for a VireoFormFreeSoloAutocompleteMultipleField slot or state. */
export function getVireoFormFreeSoloAutocompleteMultipleFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormFreeSoloAutocompleteMultipleField class key. */
export const vireoFormFreeSoloAutocompleteMultipleFieldClasses: VireoFormFreeSoloAutocompleteMultipleFieldClasses =
  generateUtilityClasses(VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME, [
    ...VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_SLOTS,
    ...VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_STATES,
  ]);
