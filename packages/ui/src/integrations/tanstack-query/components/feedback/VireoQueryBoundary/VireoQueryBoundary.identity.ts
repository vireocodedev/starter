import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoQueryBoundary integration point. */
export const VIREO_QUERY_BOUNDARY_NAME = "VireoQueryBoundary";

/** Canonical public slots exposed by VireoQueryBoundary, in rendered DOM order. */
export const VIREO_QUERY_BOUNDARY_SLOTS = [
  "root",
  "loadingIndicator",
  "errorAlert",
  "actions",
  "retryButton",
  "errorDetailsButton",
  "errorDetailsDialog",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoQueryBoundary. */
export type VireoQueryBoundarySlotName = (typeof VIREO_QUERY_BOUNDARY_SLOTS)[number];
