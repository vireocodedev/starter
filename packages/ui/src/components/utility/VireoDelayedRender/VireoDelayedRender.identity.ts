import type { VireoSlotNameTuple } from "@/utils/muiutils";

/** Stable component name shared by every VireoDelayedRender integration point. */
export const VIREO_DELAYED_RENDER_NAME = "VireoDelayedRender";

/** Canonical public slots exposed by VireoDelayedRender, in rendered DOM order. */
export const VIREO_DELAYED_RENDER_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoDelayedRender. */
export type VireoDelayedRenderSlotName = (typeof VIREO_DELAYED_RENDER_SLOTS)[number];
