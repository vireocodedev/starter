import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_ACTIONS_NAME,
  VIREO_FORM_ACTIONS_SLOTS,
  type VireoFormActionsSlotName,
} from "./VireoFormActions.identity";

/** Utility classes available to VireoFormActions. */
export type VireoFormActionsClasses = Record<VireoFormActionsSlotName, string>;

/** Valid keys for VireoFormActions utility classes and theme style overrides. */
export type VireoFormActionsClassKey = keyof VireoFormActionsClasses;

/** Returns the generated utility class name for a VireoFormActions slot or state. */
export function getVireoFormActionsUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_ACTIONS_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormActions class key. */
export const vireoFormActionsClasses: VireoFormActionsClasses = generateUtilityClasses(VIREO_FORM_ACTIONS_NAME, [
  ...VIREO_FORM_ACTIONS_SLOTS,
]);
