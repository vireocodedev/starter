import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoConfirmationDialog integration point. */
export const VIREO_CONFIRMATION_DIALOG_NAME = "VireoConfirmationDialog";

/** Canonical public slots exposed by VireoConfirmationDialog, in rendered DOM order. */
export const VIREO_CONFIRMATION_DIALOG_SLOTS = [
  "root",
  "header",
  "content",
  "actions",
  "cancelButton",
  "confirmButton",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoConfirmationDialog. */
export type VireoConfirmationDialogSlotName = (typeof VIREO_CONFIRMATION_DIALOG_SLOTS)[number];
