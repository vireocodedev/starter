import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME,
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_SLOTS,
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_STATES,
  type VireoFormFreeSoloAutocompleteFieldSlotName,
  type VireoFormFreeSoloAutocompleteFieldStateName,
} from "./VireoFormFreeSoloAutocompleteField.identity";

/** Utility classes available to VireoFormFreeSoloAutocompleteField. */
export type VireoFormFreeSoloAutocompleteFieldClasses = Record<
  VireoFormFreeSoloAutocompleteFieldSlotName | VireoFormFreeSoloAutocompleteFieldStateName,
  string
>;

/** Valid keys for VireoFormFreeSoloAutocompleteField utility classes and theme style overrides. */
export type VireoFormFreeSoloAutocompleteFieldClassKey = keyof VireoFormFreeSoloAutocompleteFieldClasses;

/** Returns the generated utility class name for a VireoFormFreeSoloAutocompleteField slot or state. */
export function getVireoFormFreeSoloAutocompleteFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormFreeSoloAutocompleteField class key. */
export const vireoFormFreeSoloAutocompleteFieldClasses: VireoFormFreeSoloAutocompleteFieldClasses =
  generateUtilityClasses(VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME, [
    ...VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_SLOTS,
    ...VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_STATES,
  ]);
