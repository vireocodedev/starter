import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_INFINITE_CANVAS_NAME,
  VIREO_INFINITE_CANVAS_SLOTS,
  type VireoInfiniteCanvasSlotName,
} from "./VireoInfiniteCanvas.identity";

/** Utility classes available to VireoInfiniteCanvas. */
export type VireoInfiniteCanvasClasses = Record<VireoInfiniteCanvasSlotName, string>;

/** Valid keys for VireoInfiniteCanvas utility classes and theme style overrides. */
export type VireoInfiniteCanvasClassKey = keyof VireoInfiniteCanvasClasses;

/** Returns the generated utility class name for a VireoInfiniteCanvas slot or state. */
export function getVireoInfiniteCanvasUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_INFINITE_CANVAS_NAME, slot);
}

/** Generated utility class names keyed by each public VireoInfiniteCanvas class key. */
export const vireoInfiniteCanvasClasses: VireoInfiniteCanvasClasses = generateUtilityClasses(
  VIREO_INFINITE_CANVAS_NAME,
  [...VIREO_INFINITE_CANVAS_SLOTS],
);
