import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_AUTOCOMPLETE_MULTIPLE_NAME,
  VIREO_AUTOCOMPLETE_MULTIPLE_SLOTS,
  type VireoAutocompleteMultipleSlotName,
} from "./VireoAutocompleteMultiple.identity";

/** Utility classes available to VireoAutocompleteMultiple. */
export type VireoAutocompleteMultipleClasses = Record<VireoAutocompleteMultipleSlotName, string>;

/** Valid keys for VireoAutocompleteMultiple utility classes and theme style overrides. */
export type VireoAutocompleteMultipleClassKey = keyof VireoAutocompleteMultipleClasses;

/** Returns the generated utility class name for a VireoAutocompleteMultiple slot or state. */
export function getVireoAutocompleteMultipleUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_AUTOCOMPLETE_MULTIPLE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoAutocompleteMultiple class key. */
export const vireoAutocompleteMultipleClasses: VireoAutocompleteMultipleClasses = generateUtilityClasses(
  VIREO_AUTOCOMPLETE_MULTIPLE_NAME,
  [...VIREO_AUTOCOMPLETE_MULTIPLE_SLOTS],
);
