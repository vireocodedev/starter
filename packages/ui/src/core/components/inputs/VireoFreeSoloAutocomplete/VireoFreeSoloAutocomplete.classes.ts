import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FREE_SOLO_AUTOCOMPLETE_NAME,
  VIREO_FREE_SOLO_AUTOCOMPLETE_SLOTS,
  type VireoFreeSoloAutocompleteSlotName,
} from "./VireoFreeSoloAutocomplete.identity";

/** Utility classes available to VireoFreeSoloAutocomplete. */
export type VireoFreeSoloAutocompleteClasses = Record<VireoFreeSoloAutocompleteSlotName, string>;

/** Valid keys for VireoFreeSoloAutocomplete utility classes and theme style overrides. */
export type VireoFreeSoloAutocompleteClassKey = keyof VireoFreeSoloAutocompleteClasses;

/** Returns the generated utility class name for a VireoFreeSoloAutocomplete slot or state. */
export function getVireoFreeSoloAutocompleteUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FREE_SOLO_AUTOCOMPLETE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFreeSoloAutocomplete class key. */
export const vireoFreeSoloAutocompleteClasses: VireoFreeSoloAutocompleteClasses = generateUtilityClasses(
  VIREO_FREE_SOLO_AUTOCOMPLETE_NAME,
  [...VIREO_FREE_SOLO_AUTOCOMPLETE_SLOTS],
);
