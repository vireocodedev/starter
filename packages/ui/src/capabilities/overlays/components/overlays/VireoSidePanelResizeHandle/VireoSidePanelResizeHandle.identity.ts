import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoSidePanelResizeHandle integration point. */
export const VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME = "VireoSidePanelResizeHandle";

/** Canonical public slots exposed by VireoSidePanelResizeHandle, in rendered DOM order. */
export const VIREO_SIDE_PANEL_RESIZE_HANDLE_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoSidePanelResizeHandle. */
export type VireoSidePanelResizeHandleSlotName = (typeof VIREO_SIDE_PANEL_RESIZE_HANDLE_SLOTS)[number];
