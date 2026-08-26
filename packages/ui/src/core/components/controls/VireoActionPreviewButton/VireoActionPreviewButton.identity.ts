import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoActionPreviewButton integration point. */
export const VIREO_ACTION_PREVIEW_BUTTON_NAME = "VireoActionPreviewButton";

/** Canonical public slots exposed by VireoActionPreviewButton, in rendered DOM order. */
export const VIREO_ACTION_PREVIEW_BUTTON_SLOTS = [
  "root",
  "content",
  "label",
  "preview",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoActionPreviewButton. */
export type VireoActionPreviewButtonSlotName = (typeof VIREO_ACTION_PREVIEW_BUTTON_SLOTS)[number];
