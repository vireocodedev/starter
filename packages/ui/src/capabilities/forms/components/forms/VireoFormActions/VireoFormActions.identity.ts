import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormActions integration point. */
export const VIREO_FORM_ACTIONS_NAME = "VireoFormActions";

/** Canonical public slots exposed by VireoFormActions, in rendered DOM order. */
export const VIREO_FORM_ACTIONS_SLOTS = ["root", "layout"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormActions. */
export type VireoFormActionsSlotName = (typeof VIREO_FORM_ACTIONS_SLOTS)[number];
