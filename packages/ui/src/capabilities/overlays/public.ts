export * from "./components/overlays/VireoOverlayHeader";
export {
  PageOverlayControllerContext,
  usePageOverlayController,
  type PageOverlayControllerValue,
} from "./page-overlays/contexts/PageOverlayControllerContext/PageOverlayControllerContext";
export {
  useGuardedOverlayModeSwitch,
  type GuardedOverlayModeSwitch,
} from "./page-overlays/hooks/useGuardedOverlayModeSwitch/useGuardedOverlayModeSwitch";
export { useRafViewportWidth } from "./hooks/useRafViewportWidth/useRafViewportWidth";
export { useSidePanelResize } from "./hooks/useSidePanelResize/useSidePanelResize";
export {
  DEFAULT_DESKTOP_SIDE_PANEL_MIN_WIDTH,
  DEFAULT_DESKTOP_SIDE_PANEL_VIEWPORT_INSET,
  DESKTOP_SIDE_PANEL_WIDTH_BY_MAX_WIDTH,
  DOCKED_SIDE_PANEL_TRANSITION_EVENT,
  DOCKED_SIDE_PANEL_TRANSITION_MS,
  SIDE_PANEL_RESIZE_ACTIVE_OPACITY,
  SIDE_PANEL_RESIZE_HANDLE_WIDTH,
  SIDE_PANEL_RESIZE_HITBOX_WIDTH,
  SIDE_PANEL_RESIZE_HOVER_OPACITY,
  SIDE_PANEL_WIDTH_CSS_VAR,
  type DockedSidePanelTransitionEventDetail,
} from "./constants/overlay.constants";
export type {
  ResponsiveOverlayFrameDesktopSidePanelWidth,
  ResponsiveOverlayFrameDesktopSurface,
  ResponsiveOverlayFrameProps,
} from "./types/overlay.types";
export {
  clampSidePanelWidth,
  getDefaultDesktopSidePanelWidth,
  getNumericDesktopSidePanelWidth,
  resolveDockedSidePanelWidth,
} from "./utils/overlay.utils";
