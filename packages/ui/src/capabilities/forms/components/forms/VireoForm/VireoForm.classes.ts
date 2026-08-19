import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_NAME,
  VIREO_FORM_SLOTS,
  VIREO_FORM_STATES,
  type VireoFormSlotName,
  type VireoFormStateName,
} from "./VireoForm.identity";

/** Utility classes available to VireoForm. */
export type VireoFormClasses = Record<VireoFormSlotName | VireoFormStateName, string>;

/** Valid keys for VireoForm utility classes and theme style overrides. */
export type VireoFormClassKey = keyof VireoFormClasses;

/** Returns the generated utility class name for a VireoForm slot or state. */
export function getVireoFormUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_NAME, slot);
}

/** Generated utility class names keyed by each public VireoForm class key. */
export const vireoFormClasses: VireoFormClasses = generateUtilityClasses(VIREO_FORM_NAME, [
  ...VIREO_FORM_SLOTS,
  ...VIREO_FORM_STATES,
]);
