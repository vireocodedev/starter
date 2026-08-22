import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_DRAG_HANDLE_NAME,
  VIREO_DRAG_HANDLE_SLOTS,
  type VireoDragHandleSlotName,
} from "./VireoDragHandle.identity";

/** Utility classes available to VireoDragHandle. */
export type VireoDragHandleClasses = Record<VireoDragHandleSlotName | "disabled" | "dragging", string>;

/** Valid keys for VireoDragHandle utility classes and theme style overrides. */
export type VireoDragHandleClassKey = keyof VireoDragHandleClasses;

/** Returns the generated utility class name for a VireoDragHandle slot or state. */
export function getVireoDragHandleUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_DRAG_HANDLE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoDragHandle class key. */
export const vireoDragHandleClasses: VireoDragHandleClasses = generateUtilityClasses(VIREO_DRAG_HANDLE_NAME, [
  ...VIREO_DRAG_HANDLE_SLOTS,
  "disabled",
  "dragging",
]);
