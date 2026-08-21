import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoInfiniteCanvas integration point. */
export const VIREO_INFINITE_CANVAS_NAME = "VireoInfiniteCanvas";

/** Canonical public slots exposed by VireoInfiniteCanvas, in rendered DOM order. */
export const VIREO_INFINITE_CANVAS_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoInfiniteCanvas. */
export type VireoInfiniteCanvasSlotName = (typeof VIREO_INFINITE_CANVAS_SLOTS)[number];
