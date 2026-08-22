import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormSection integration point. */
export const VIREO_FORM_SECTION_NAME = "VireoFormSection";

/** Canonical public slots exposed by VireoFormSection, in rendered DOM order. */
export const VIREO_FORM_SECTION_SLOTS = [
  "root",
  "header",
  "label",
  "description",
  "content",
  "layout",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormSection. */
export type VireoFormSectionSlotName = (typeof VIREO_FORM_SECTION_SLOTS)[number];
