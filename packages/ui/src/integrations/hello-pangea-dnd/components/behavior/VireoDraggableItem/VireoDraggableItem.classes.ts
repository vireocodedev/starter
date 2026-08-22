import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_DRAGGABLE_ITEM_NAME,
  VIREO_DRAGGABLE_ITEM_SLOTS,
  type VireoDraggableItemSlotName,
} from "./VireoDraggableItem.identity";

/** Utility classes available to VireoDraggableItem. */
export type VireoDraggableItemClasses = Record<VireoDraggableItemSlotName | "disabled" | "dragging", string>;

/** Valid keys for VireoDraggableItem utility classes and theme style overrides. */
export type VireoDraggableItemClassKey = keyof VireoDraggableItemClasses;

/** Returns the generated utility class name for a VireoDraggableItem slot or state. */
export function getVireoDraggableItemUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_DRAGGABLE_ITEM_NAME, slot);
}

/** Generated utility class names keyed by each public VireoDraggableItem class key. */
export const vireoDraggableItemClasses: VireoDraggableItemClasses = generateUtilityClasses(VIREO_DRAGGABLE_ITEM_NAME, [
  ...VIREO_DRAGGABLE_ITEM_SLOTS,
  "disabled",
  "dragging",
]);
