import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_DELAYED_RENDER_NAME,
  VIREO_DELAYED_RENDER_SLOTS,
  type VireoDelayedRenderSlotName,
} from "./VireoDelayedRender.identity";

/** Utility classes available to VireoDelayedRender. */
export type VireoDelayedRenderClasses = Record<VireoDelayedRenderSlotName, string>;

/** Valid keys for VireoDelayedRender utility classes and theme style overrides. */
export type VireoDelayedRenderClassKey = keyof VireoDelayedRenderClasses;

/** Returns the generated utility class name for a VireoDelayedRender slot or state. */
export function getVireoDelayedRenderUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_DELAYED_RENDER_NAME, slot);
}

/** Generated utility class names keyed by each public VireoDelayedRender class key. */
export const vireoDelayedRenderClasses: VireoDelayedRenderClasses = generateUtilityClasses(VIREO_DELAYED_RENDER_NAME, [
  ...VIREO_DELAYED_RENDER_SLOTS,
]);
