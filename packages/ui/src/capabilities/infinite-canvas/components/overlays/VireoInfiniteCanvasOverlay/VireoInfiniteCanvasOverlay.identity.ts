import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoInfiniteCanvasOverlay integration point. */
export const VIREO_INFINITE_CANVAS_OVERLAY_NAME = "VireoInfiniteCanvasOverlay";

/** Canonical public slots exposed by VireoInfiniteCanvasOverlay, in rendered DOM order. */
export const VIREO_INFINITE_CANVAS_OVERLAY_SLOTS = ["root", "content"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoInfiniteCanvasOverlay. */
export type VireoInfiniteCanvasOverlaySlotName = (typeof VIREO_INFINITE_CANVAS_OVERLAY_SLOTS)[number];
