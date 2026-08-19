import { type DialogProps } from "@mui/material";

export const DEFAULT_DESKTOP_SIDE_PANEL_MIN_WIDTH = 360;
export const DEFAULT_DESKTOP_SIDE_PANEL_VIEWPORT_INSET = 48;
export const DOCKED_SIDE_PANEL_TRANSITION_MS = 180;
export const SIDE_PANEL_WIDTH_CSS_VAR = "--responsive-overlay-side-panel-width";
export const DOCKED_SIDE_PANEL_TRANSITION_EVENT = "responsive-overlay:docked-side-panel-transition";
export const SIDE_PANEL_RESIZE_HANDLE_WIDTH = 6;
export const SIDE_PANEL_RESIZE_HITBOX_WIDTH = 14;
export const SIDE_PANEL_RESIZE_HOVER_OPACITY = 0.35;
export const SIDE_PANEL_RESIZE_ACTIVE_OPACITY = 0.7;

export type DockedSidePanelTransitionEventDetail = {
  animating: boolean;
};

export const DESKTOP_SIDE_PANEL_WIDTH_BY_MAX_WIDTH: Record<
  Exclude<DialogProps["maxWidth"], undefined | false>,
  number
> = {
  xs: 360,
  sm: 480,
  md: 560,
  lg: 760,
  xl: 960,
};
