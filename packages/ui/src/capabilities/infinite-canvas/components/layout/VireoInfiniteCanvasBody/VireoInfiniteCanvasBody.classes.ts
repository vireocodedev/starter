import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_INFINITE_CANVAS_BODY_NAME,
  VIREO_INFINITE_CANVAS_BODY_SLOTS,
  type VireoInfiniteCanvasBodySlotName,
} from "./VireoInfiniteCanvasBody.identity";

/** Utility classes available to VireoInfiniteCanvasBody. */
export type VireoInfiniteCanvasBodyClasses = Record<VireoInfiniteCanvasBodySlotName, string>;

/** Valid keys for VireoInfiniteCanvasBody utility classes and theme style overrides. */
export type VireoInfiniteCanvasBodyClassKey = keyof VireoInfiniteCanvasBodyClasses;

/** Returns the generated utility class name for a VireoInfiniteCanvasBody slot or state. */
export function getVireoInfiniteCanvasBodyUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_INFINITE_CANVAS_BODY_NAME, slot);
}

/** Generated utility class names keyed by each public VireoInfiniteCanvasBody class key. */
export const vireoInfiniteCanvasBodyClasses: VireoInfiniteCanvasBodyClasses = generateUtilityClasses(
  VIREO_INFINITE_CANVAS_BODY_NAME,
  [...VIREO_INFINITE_CANVAS_BODY_SLOTS],
);
