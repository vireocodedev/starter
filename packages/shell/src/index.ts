export { defineShellConfig, ShellModeSchema } from "./config/shellConfig";
export type { ShellConfig, ShellConfigValidationOptions, ShellMode } from "./config/shellConfig";
export { createAuthRedirectState, isSafeInternalPath, resolvePostLoginPath } from "./navigation/authRedirect";
export type { ShellAuthRedirectState, ShellLocationSnapshot } from "./navigation/authRedirect";
export { ShellNavigationIdSchema, shellNavigation } from "./navigation/shellNavigation";
export type { ShellNavigationEntry } from "./navigation/shellNavigation";
export {
  createOverlayHistoryRegistry,
  getCommonOverlayPrefixLength,
  OVERLAY_HISTORY_STATE_KEY,
  readOverlayStack,
  resolveOverlayHistoryAction,
  withOverlayStack,
} from "./overlay-history/overlayHistory";
export type {
  OverlayHistoryAction,
  OverlayHistoryEntry,
  OverlayHistoryEntryId,
  OverlayHistoryRegistry,
  OverlayHistoryResolveInput,
} from "./overlay-history/overlayHistory";
export {
  generateShellPath,
  getRequiredRouteParamNames,
  joinRoutePattern,
  normalizeRoutePath,
} from "./sitemap/routePath";
export {
  createShellSitemap,
  defineShellPages,
  defineShellSections,
  ShellRouteKeySchema,
  ShellRoutePathSchema,
} from "./sitemap/shellSitemap";
export type {
  ResolvedShellRoute,
  ShellLabel,
  ShellPage,
  ShellPageDefinition,
  ShellPathForPage,
  ShellPermission,
  ShellPermissionScope,
  ShellRouteMetadata,
  ShellRouteNode,
  ShellRouteParams,
  ShellRouteParamValue,
  ShellRouteTreeNode,
  ShellRouteTreePageEntries,
  ShellSection,
  ShellSectionDefinition,
  ShellSitemap,
} from "./sitemap/shellSitemap.types";
