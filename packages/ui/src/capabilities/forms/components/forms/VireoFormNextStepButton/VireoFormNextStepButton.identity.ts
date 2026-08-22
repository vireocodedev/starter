import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormNextStepButton integration point. */
export const VIREO_FORM_NEXT_STEP_BUTTON_NAME = "VireoFormNextStepButton";

/** Canonical public slots exposed by VireoFormNextStepButton, in rendered DOM order. */
export const VIREO_FORM_NEXT_STEP_BUTTON_SLOTS = ["root", "loadingIndicator"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormNextStepButton. */
export type VireoFormNextStepButtonSlotName = (typeof VIREO_FORM_NEXT_STEP_BUTTON_SLOTS)[number];

export const VIREO_FORM_NEXT_STEP_BUTTON_STATES = ["disabled", "loading", "lastStep"] as const;
export type VireoFormNextStepButtonStateName = (typeof VIREO_FORM_NEXT_STEP_BUTTON_STATES)[number];
