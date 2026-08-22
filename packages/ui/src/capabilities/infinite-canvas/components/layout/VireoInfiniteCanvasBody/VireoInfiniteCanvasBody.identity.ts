import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoInfiniteCanvasBody integration point. */
export const VIREO_INFINITE_CANVAS_BODY_NAME = "VireoInfiniteCanvasBody";

/** Canonical public slots exposed by VireoInfiniteCanvasBody, in rendered DOM order. */
export const VIREO_INFINITE_CANVAS_BODY_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoInfiniteCanvasBody. */
export type VireoInfiniteCanvasBodySlotName = (typeof VIREO_INFINITE_CANVAS_BODY_SLOTS)[number];
