import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoDraggableItem integration point. */
export const VIREO_DRAGGABLE_ITEM_NAME = "VireoDraggableItem";

/** Canonical public slots exposed by VireoDraggableItem, in rendered DOM order. */
export const VIREO_DRAGGABLE_ITEM_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoDraggableItem. */
export type VireoDraggableItemSlotName = (typeof VIREO_DRAGGABLE_ITEM_SLOTS)[number];
