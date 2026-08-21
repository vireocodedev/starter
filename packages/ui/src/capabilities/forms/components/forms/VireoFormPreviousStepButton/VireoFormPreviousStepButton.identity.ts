import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormPreviousStepButton integration point. */
export const VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME = "VireoFormPreviousStepButton";

/** Canonical public slots exposed by VireoFormPreviousStepButton, in rendered DOM order. */
export const VIREO_FORM_PREVIOUS_STEP_BUTTON_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormPreviousStepButton. */
export type VireoFormPreviousStepButtonSlotName = (typeof VIREO_FORM_PREVIOUS_STEP_BUTTON_SLOTS)[number];

export const VIREO_FORM_PREVIOUS_STEP_BUTTON_STATES = ["disabled", "firstStep"] as const;
export type VireoFormPreviousStepButtonStateName = (typeof VIREO_FORM_PREVIOUS_STEP_BUTTON_STATES)[number];
