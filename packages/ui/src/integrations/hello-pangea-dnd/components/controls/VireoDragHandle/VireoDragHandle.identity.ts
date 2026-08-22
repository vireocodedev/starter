import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoDragHandle integration point. */
export const VIREO_DRAG_HANDLE_NAME = "VireoDragHandle";

/** Canonical public slots exposed by VireoDragHandle, in rendered DOM order. */
export const VIREO_DRAG_HANDLE_SLOTS = ["root", "icon"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoDragHandle. */
export type VireoDragHandleSlotName = (typeof VIREO_DRAG_HANDLE_SLOTS)[number];
