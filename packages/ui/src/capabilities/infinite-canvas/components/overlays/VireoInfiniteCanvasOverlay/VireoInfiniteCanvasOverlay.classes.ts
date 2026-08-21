import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_INFINITE_CANVAS_OVERLAY_NAME,
  VIREO_INFINITE_CANVAS_OVERLAY_SLOTS,
  type VireoInfiniteCanvasOverlaySlotName,
} from "./VireoInfiniteCanvasOverlay.identity";

/** Utility classes available to VireoInfiniteCanvasOverlay. */
export type VireoInfiniteCanvasOverlayClasses = Record<VireoInfiniteCanvasOverlaySlotName, string>;

/** Valid keys for VireoInfiniteCanvasOverlay utility classes and theme style overrides. */
export type VireoInfiniteCanvasOverlayClassKey = keyof VireoInfiniteCanvasOverlayClasses;

/** Returns the generated utility class name for a VireoInfiniteCanvasOverlay slot or state. */
export function getVireoInfiniteCanvasOverlayUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_INFINITE_CANVAS_OVERLAY_NAME, slot);
}

/** Generated utility class names keyed by each public VireoInfiniteCanvasOverlay class key. */
export const vireoInfiniteCanvasOverlayClasses: VireoInfiniteCanvasOverlayClasses = generateUtilityClasses(
  VIREO_INFINITE_CANVAS_OVERLAY_NAME,
  [...VIREO_INFINITE_CANVAS_OVERLAY_SLOTS],
);
