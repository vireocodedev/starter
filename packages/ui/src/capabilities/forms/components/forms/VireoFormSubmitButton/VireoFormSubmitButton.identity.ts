import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormSubmitButton integration point. */
export const VIREO_FORM_SUBMIT_BUTTON_NAME = "VireoFormSubmitButton";

/** Canonical public slots exposed by VireoFormSubmitButton, in rendered DOM order. */
export const VIREO_FORM_SUBMIT_BUTTON_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormSubmitButton. */
export type VireoFormSubmitButtonSlotName = (typeof VIREO_FORM_SUBMIT_BUTTON_SLOTS)[number];

/** Canonical state classes exposed by VireoFormSubmitButton. */
export const VIREO_FORM_SUBMIT_BUTTON_STATES = ["disabled", "loading", "submitting"] as const;

/** Public state names exposed by VireoFormSubmitButton. */
export type VireoFormSubmitButtonStateName = (typeof VIREO_FORM_SUBMIT_BUTTON_STATES)[number];
