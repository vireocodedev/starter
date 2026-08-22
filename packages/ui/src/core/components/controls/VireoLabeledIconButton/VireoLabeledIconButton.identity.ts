import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoLabeledIconButton integration point. */
export const VIREO_LABELED_ICON_BUTTON_NAME = "VireoLabeledIconButton";

/** Canonical public slots exposed by VireoLabeledIconButton, in rendered DOM order. */
export const VIREO_LABELED_ICON_BUTTON_SLOTS = [
  "root",
  "visual",
  "statusDot",
  "label",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoLabeledIconButton. */
export type VireoLabeledIconButtonSlotName = (typeof VIREO_LABELED_ICON_BUTTON_SLOTS)[number];
