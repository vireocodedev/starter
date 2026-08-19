import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME,
  VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_SLOTS,
  type VireoFreeSoloAutocompleteMultipleSlotName,
} from "./VireoFreeSoloAutocompleteMultiple.identity";

/** Utility classes available to VireoFreeSoloAutocompleteMultiple. */
export type VireoFreeSoloAutocompleteMultipleClasses = Record<VireoFreeSoloAutocompleteMultipleSlotName, string>;

/** Valid keys for VireoFreeSoloAutocompleteMultiple utility classes and theme style overrides. */
export type VireoFreeSoloAutocompleteMultipleClassKey = keyof VireoFreeSoloAutocompleteMultipleClasses;

/** Returns the generated utility class name for a VireoFreeSoloAutocompleteMultiple slot or state. */
export function getVireoFreeSoloAutocompleteMultipleUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFreeSoloAutocompleteMultiple class key. */
export const vireoFreeSoloAutocompleteMultipleClasses: VireoFreeSoloAutocompleteMultipleClasses =
  generateUtilityClasses(VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME, [...VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_SLOTS]);
