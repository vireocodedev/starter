import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
  VIREO_RESPONSIVE_FORM_OVERLAY_SLOTS,
  type VireoResponsiveFormOverlaySlotName,
} from "./VireoResponsiveFormOverlay.identity";

/** Utility classes available to VireoResponsiveFormOverlay. */
export type VireoResponsiveFormOverlayClasses = Record<VireoResponsiveFormOverlaySlotName, string>;

/** Valid keys for VireoResponsiveFormOverlay utility classes and theme style overrides. */
export type VireoResponsiveFormOverlayClassKey = keyof VireoResponsiveFormOverlayClasses;

/** Returns the generated utility class name for a VireoResponsiveFormOverlay slot or state. */
export function getVireoResponsiveFormOverlayUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_RESPONSIVE_FORM_OVERLAY_NAME, slot);
}

/** Generated utility class names keyed by each public VireoResponsiveFormOverlay class key. */
export const vireoResponsiveFormOverlayClasses: VireoResponsiveFormOverlayClasses = generateUtilityClasses(
  VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
  [...VIREO_RESPONSIVE_FORM_OVERLAY_SLOTS],
);
