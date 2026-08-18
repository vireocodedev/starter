import type { VireoSlotNameTuple } from "@/utils/muiutils";

/** Stable component name shared by every VireoIconContainer integration point. */
export const VIREO_ICON_CONTAINER_NAME = "VireoIconContainer";

/** Canonical public slots exposed by VireoIconContainer, in rendered DOM order. */
export const VIREO_ICON_CONTAINER_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoIconContainer. */
export type VireoIconContainerSlotName = (typeof VIREO_ICON_CONTAINER_SLOTS)[number];
