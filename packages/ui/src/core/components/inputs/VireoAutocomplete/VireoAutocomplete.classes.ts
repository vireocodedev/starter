import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_AUTOCOMPLETE_NAME,
  VIREO_AUTOCOMPLETE_SLOTS,
  type VireoAutocompleteSlotName,
} from "./VireoAutocomplete.identity";

/** Utility classes available to VireoAutocomplete. */
export type VireoAutocompleteClasses = Record<VireoAutocompleteSlotName, string>;

/** Valid keys for VireoAutocomplete utility classes and theme style overrides. */
export type VireoAutocompleteClassKey = keyof VireoAutocompleteClasses;

/** Returns the generated utility class name for a VireoAutocomplete slot or state. */
export function getVireoAutocompleteUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_AUTOCOMPLETE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoAutocomplete class key. */
export const vireoAutocompleteClasses: VireoAutocompleteClasses = generateUtilityClasses(VIREO_AUTOCOMPLETE_NAME, [
  ...VIREO_AUTOCOMPLETE_SLOTS,
]);
