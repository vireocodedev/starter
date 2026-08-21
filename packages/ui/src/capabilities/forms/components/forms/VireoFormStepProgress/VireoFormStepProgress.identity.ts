import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormStepProgress integration point. */
export const VIREO_FORM_STEP_PROGRESS_NAME = "VireoFormStepProgress";

/** Canonical public slots exposed by VireoFormStepProgress, in rendered DOM order. */
export const VIREO_FORM_STEP_PROGRESS_SLOTS = [
  "root",
  "list",
  "step",
  "stepButton",
  "statusIcon",
  "stepLabel",
  "connector",
  "compactRoot",
  "compactTrigger",
  "compactLabel",
  "compactCount",
  "compactProgress",
  "menu",
  "menuItem",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormStepProgress. */
export type VireoFormStepProgressSlotName = (typeof VIREO_FORM_STEP_PROGRESS_SLOTS)[number];
