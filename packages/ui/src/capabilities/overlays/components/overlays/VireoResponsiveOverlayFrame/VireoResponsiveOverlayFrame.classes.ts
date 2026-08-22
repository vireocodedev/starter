import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_RESPONSIVE_OVERLAY_FRAME_NAME,
  VIREO_RESPONSIVE_OVERLAY_FRAME_SLOTS,
  type VireoResponsiveOverlayFrameSlotName,
} from "./VireoResponsiveOverlayFrame.identity";

/** Utility classes available to VireoResponsiveOverlayFrame. */
export type VireoResponsiveOverlayFrameClasses = Record<VireoResponsiveOverlayFrameSlotName, string>;

/** Valid keys for VireoResponsiveOverlayFrame utility classes and theme style overrides. */
export type VireoResponsiveOverlayFrameClassKey = keyof VireoResponsiveOverlayFrameClasses;

/** Returns the generated utility class name for a VireoResponsiveOverlayFrame slot or state. */
export function getVireoResponsiveOverlayFrameUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_RESPONSIVE_OVERLAY_FRAME_NAME, slot);
}

/** Generated utility class names keyed by each public VireoResponsiveOverlayFrame class key. */
export const vireoResponsiveOverlayFrameClasses: VireoResponsiveOverlayFrameClasses = generateUtilityClasses(
  VIREO_RESPONSIVE_OVERLAY_FRAME_NAME,
  [...VIREO_RESPONSIVE_OVERLAY_FRAME_SLOTS],
);
