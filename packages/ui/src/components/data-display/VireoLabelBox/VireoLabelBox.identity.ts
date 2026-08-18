import type { VireoSlotNameTuple } from "@/utils/muiutils";

/** Stable component name shared by every VireoLabelBox integration point. */
export const VIREO_LABEL_BOX_NAME = "VireoLabelBox";

/** Canonical public slots exposed by VireoLabelBox, in rendered DOM order. */
export const VIREO_LABEL_BOX_SLOTS = [
  "root",
  "header",
  "label",
  "requiredIndicator",
  "helperText",
  "content",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoLabelBox. */
export type VireoLabelBoxSlotName = (typeof VIREO_LABEL_BOX_SLOTS)[number];
