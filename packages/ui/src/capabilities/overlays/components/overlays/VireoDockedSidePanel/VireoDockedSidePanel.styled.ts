import { VIREO_MOTION_TOKENS, type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { DOCKED_SIDE_PANEL_TRANSITION_MS } from "@/capabilities/overlays/constants/overlay.constants";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_DOCKED_SIDE_PANEL_NAME } from "./VireoDockedSidePanel.identity";
import { type VireoDockedSidePanelOwnerState } from "./VireoDockedSidePanel.types";

type VireoDockedSidePanelStyledSlotProps = StyledSlotProps<VireoDockedSidePanelOwnerState>;
type VireoDockedSidePanelStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoDockedSidePanelOwnerState
>;

export const VireoDockedSidePanelRoot: VireoDockedSidePanelStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_DOCKED_SIDE_PANEL_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoDockedSidePanelStyledSlotProps>(({ ownerState }) => ({
  flex: "0 0 auto",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  pointerEvents: ownerState.open ? "auto" : "none",
  contain: "layout paint",
}));

export const VireoDockedSidePanelSurface: VireoDockedSidePanelStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_DOCKED_SIDE_PANEL_NAME,
  slot: "Surface",
  overridesResolver: (_props, styles) => styles.surface,
})<VireoDockedSidePanelStyledSlotProps>(({ ownerState, theme }) => ({
  position: "relative",
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.divider}`,
  transform: ownerState.isPanelEntered ? "translateX(0)" : `translateX(${VIREO_MOTION_TOKENS.distance.surface}px)`,
  opacity: ownerState.isPanelEntered ? 1 : 0,
  transition: ownerState.isResizing
    ? "none"
    : theme.transitions.create(["transform", "opacity"], {
        duration: DOCKED_SIDE_PANEL_TRANSITION_MS,
        easing: VIREO_MOTION_TOKENS.easing.standard,
      }),
  willChange: ownerState.isResizing ? "auto" : "transform, opacity",
  backfaceVisibility: "hidden",
  "@media (prefers-reduced-motion: reduce)": {
    transform: "none",
    transitionDuration: "0ms",
    willChange: "auto",
  },
}));
