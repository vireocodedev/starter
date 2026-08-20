import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFileImagePreview integration point. */
export const VIREO_FILE_IMAGE_PREVIEW_NAME = "VireoFileImagePreview";

/** Canonical public slots exposed by VireoFileImagePreview, in rendered DOM order. */
export const VIREO_FILE_IMAGE_PREVIEW_SLOTS = ["root", "image", "fallback"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFileImagePreview. */
export type VireoFileImagePreviewSlotName = (typeof VIREO_FILE_IMAGE_PREVIEW_SLOTS)[number];
