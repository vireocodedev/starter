import type { VireoSlotNameTuple } from "@/utils/muiutils";

/** Stable component name shared by every VireoTruncatedContent integration point. */
export const VIREO_TRUNCATED_CONTENT_NAME = "VireoTruncatedContent";

/** Canonical public slots exposed by VireoTruncatedContent, in rendered DOM order. */
export const VIREO_TRUNCATED_CONTENT_SLOTS = [
  "root",
  "viewport",
  "content",
  "toggle",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoTruncatedContent. */
export type VireoTruncatedContentSlotName = (typeof VIREO_TRUNCATED_CONTENT_SLOTS)[number];
