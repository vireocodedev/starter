import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_SECTION_ITEM_NAME,
  VIREO_FORM_SECTION_ITEM_SLOTS,
  type VireoFormSectionItemSlotName,
} from "./VireoFormSectionItem.identity";

/** Utility classes available to VireoFormSectionItem. */
export type VireoFormSectionItemClasses = Record<VireoFormSectionItemSlotName, string>;

/** Valid keys for VireoFormSectionItem utility classes and theme style overrides. */
export type VireoFormSectionItemClassKey = keyof VireoFormSectionItemClasses;

/** Returns the generated utility class name for a VireoFormSectionItem slot or state. */
export function getVireoFormSectionItemUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_SECTION_ITEM_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormSectionItem class key. */
export const vireoFormSectionItemClasses: VireoFormSectionItemClasses = generateUtilityClasses(
  VIREO_FORM_SECTION_ITEM_NAME,
  [...VIREO_FORM_SECTION_ITEM_SLOTS],
);
