import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoJsonViewer integration point. */
export const VIREO_JSON_VIEWER_NAME = "VireoJsonViewer";

/** Canonical public slots exposed by VireoJsonViewer, in rendered DOM order. */
export const VIREO_JSON_VIEWER_SLOTS = [
  "root",
  "toolbar",
  "copyButton",
  "copyIcon",
  "status",
  "content",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoJsonViewer. */
export type VireoJsonViewerSlotName = (typeof VIREO_JSON_VIEWER_SLOTS)[number];
