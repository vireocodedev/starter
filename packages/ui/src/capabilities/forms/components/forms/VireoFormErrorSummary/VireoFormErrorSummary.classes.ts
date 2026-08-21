import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_ERROR_SUMMARY_NAME,
  VIREO_FORM_ERROR_SUMMARY_SLOTS,
  type VireoFormErrorSummarySlotName,
} from "./VireoFormErrorSummary.identity";

/** Utility classes available to VireoFormErrorSummary. */
export type VireoFormErrorSummaryClasses = Record<VireoFormErrorSummarySlotName, string>;

/** Valid keys for VireoFormErrorSummary utility classes and theme style overrides. */
export type VireoFormErrorSummaryClassKey = keyof VireoFormErrorSummaryClasses;

/** Returns the generated utility class name for a VireoFormErrorSummary slot or state. */
export function getVireoFormErrorSummaryUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_ERROR_SUMMARY_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormErrorSummary class key. */
export const vireoFormErrorSummaryClasses: VireoFormErrorSummaryClasses = generateUtilityClasses(
  VIREO_FORM_ERROR_SUMMARY_NAME,
  [...VIREO_FORM_ERROR_SUMMARY_SLOTS],
);
