import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_OVERLAY_HEADER_NAME,
  VIREO_OVERLAY_HEADER_SLOTS,
  type VireoOverlayHeaderSlotName,
} from "./VireoOverlayHeader.identity";

/** Utility classes available to VireoOverlayHeader. */
export type VireoOverlayHeaderClasses = Record<VireoOverlayHeaderSlotName, string>;

/** Valid keys for VireoOverlayHeader utility classes and theme style overrides. */
export type VireoOverlayHeaderClassKey = keyof VireoOverlayHeaderClasses;

/** Returns the generated utility class name for a VireoOverlayHeader slot or state. */
export function getVireoOverlayHeaderUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_OVERLAY_HEADER_NAME, slot);
}

/** Generated utility class names keyed by each public VireoOverlayHeader class key. */
export const vireoOverlayHeaderClasses: VireoOverlayHeaderClasses = generateUtilityClasses(VIREO_OVERLAY_HEADER_NAME, [
  ...VIREO_OVERLAY_HEADER_SLOTS,
]);
