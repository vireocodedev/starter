import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormErrorSummary integration point. */
export const VIREO_FORM_ERROR_SUMMARY_NAME = "VireoFormErrorSummary";

/** Canonical public slots exposed by VireoFormErrorSummary, in rendered DOM order. */
export const VIREO_FORM_ERROR_SUMMARY_SLOTS = [
  "root",
  "icon",
  "content",
  "title",
  "group",
  "groupLabel",
  "list",
  "item",
  "itemButton",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormErrorSummary. */
export type VireoFormErrorSummarySlotName = (typeof VIREO_FORM_ERROR_SUMMARY_SLOTS)[number];
