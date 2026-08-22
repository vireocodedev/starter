import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_RESET_BUTTON_NAME,
  VIREO_FORM_RESET_BUTTON_SLOTS,
  VIREO_FORM_RESET_BUTTON_STATES,
  type VireoFormResetButtonSlotName,
  type VireoFormResetButtonStateName,
} from "./VireoFormResetButton.identity";

/** Utility classes available to VireoFormResetButton. */
export type VireoFormResetButtonClasses = Record<VireoFormResetButtonSlotName | VireoFormResetButtonStateName, string>;

/** Valid keys for VireoFormResetButton utility classes and theme style overrides. */
export type VireoFormResetButtonClassKey = keyof VireoFormResetButtonClasses;

/** Returns the generated utility class name for a VireoFormResetButton slot or state. */
export function getVireoFormResetButtonUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_RESET_BUTTON_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormResetButton class key. */
export const vireoFormResetButtonClasses: VireoFormResetButtonClasses = generateUtilityClasses(
  VIREO_FORM_RESET_BUTTON_NAME,
  [...VIREO_FORM_RESET_BUTTON_SLOTS, ...VIREO_FORM_RESET_BUTTON_STATES],
);
