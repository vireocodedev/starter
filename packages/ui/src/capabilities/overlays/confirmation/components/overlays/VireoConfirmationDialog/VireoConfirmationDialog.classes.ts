import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_CONFIRMATION_DIALOG_NAME,
  VIREO_CONFIRMATION_DIALOG_SLOTS,
  type VireoConfirmationDialogSlotName,
} from "./VireoConfirmationDialog.identity";

/** Utility classes available to VireoConfirmationDialog. */
export type VireoConfirmationDialogClasses = Record<VireoConfirmationDialogSlotName, string>;

/** Valid keys for VireoConfirmationDialog utility classes and theme style overrides. */
export type VireoConfirmationDialogClassKey = keyof VireoConfirmationDialogClasses;

/** Returns the generated utility class name for a VireoConfirmationDialog slot or state. */
export function getVireoConfirmationDialogUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_CONFIRMATION_DIALOG_NAME, slot);
}

/** Generated utility class names keyed by each public VireoConfirmationDialog class key. */
export const vireoConfirmationDialogClasses: VireoConfirmationDialogClasses = generateUtilityClasses(
  VIREO_CONFIRMATION_DIALOG_NAME,
  [...VIREO_CONFIRMATION_DIALOG_SLOTS],
);
