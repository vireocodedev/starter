import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoIcon integration point. */
export const VIREO_ICON_NAME = "VireoIcon";

/** Canonical public slots exposed by VireoIcon, in rendered DOM order. */
export const VIREO_ICON_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoIcon. */
export type VireoIconSlotName = (typeof VIREO_ICON_SLOTS)[number];
