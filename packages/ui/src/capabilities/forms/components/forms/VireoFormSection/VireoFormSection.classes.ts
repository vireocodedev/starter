import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_SECTION_NAME,
  VIREO_FORM_SECTION_SLOTS,
  type VireoFormSectionSlotName,
} from "./VireoFormSection.identity";

/** Utility classes available to VireoFormSection. */
export type VireoFormSectionClasses = Record<VireoFormSectionSlotName, string>;

/** Valid keys for VireoFormSection utility classes and theme style overrides. */
export type VireoFormSectionClassKey = keyof VireoFormSectionClasses;

/** Returns the generated utility class name for a VireoFormSection slot or state. */
export function getVireoFormSectionUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_SECTION_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormSection class key. */
export const vireoFormSectionClasses: VireoFormSectionClasses = generateUtilityClasses(VIREO_FORM_SECTION_NAME, [
  ...VIREO_FORM_SECTION_SLOTS,
]);
