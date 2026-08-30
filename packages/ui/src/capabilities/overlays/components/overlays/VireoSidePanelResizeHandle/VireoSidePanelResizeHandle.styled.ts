import { VIREO_MOTION_TOKENS, type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  SIDE_PANEL_RESIZE_ACTIVE_OPACITY,
  SIDE_PANEL_RESIZE_HANDLE_WIDTH,
  SIDE_PANEL_RESIZE_HITBOX_WIDTH,
  SIDE_PANEL_RESIZE_HOVER_OPACITY,
} from "@/capabilities/overlays/constants/overlay.constants";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME } from "./VireoSidePanelResizeHandle.identity";
import { type VireoSidePanelResizeHandleOwnerState } from "./VireoSidePanelResizeHandle.types";

type VireoSidePanelResizeHandleStyledSlotProps = StyledSlotProps<VireoSidePanelResizeHandleOwnerState>;
type VireoSidePanelResizeHandleStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoSidePanelResizeHandleOwnerState
>;

export const VireoSidePanelResizeHandleRoot: VireoSidePanelResizeHandleStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [styles.root, ownerState.isResizing && styles.resizing],
})<VireoSidePanelResizeHandleStyledSlotProps>(({ ownerState, theme }) => {
  const activeColor = theme.palette.mode === "light" ? theme.palette.grey[500] : theme.palette.grey[400];

  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIDE_PANEL_RESIZE_HITBOX_WIDTH,
    height: "100%",
    minHeight: 24,
    cursor: "col-resize",
    touchAction: "none",
    zIndex: 1300,
    backgroundColor: "transparent",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: SIDE_PANEL_RESIZE_HANDLE_WIDTH,
      height: "100%",
      backgroundColor: ownerState.isResizing ? activeColor : "transparent",
      opacity: ownerState.isResizing ? SIDE_PANEL_RESIZE_ACTIVE_OPACITY : 0,
      transition: theme.transitions.create(["opacity", "background-color"], {
        duration: VIREO_MOTION_TOKENS.duration.micro,
      }),
    },
    "&:hover::after": {
      backgroundColor: activeColor,
      opacity: ownerState.isResizing ? SIDE_PANEL_RESIZE_ACTIVE_OPACITY : SIDE_PANEL_RESIZE_HOVER_OPACITY,
    },
    "&:focus-visible::after": {
      backgroundColor: activeColor,
      opacity: SIDE_PANEL_RESIZE_HOVER_OPACITY,
    },
    "@media (prefers-reduced-motion: reduce)": {
      "&::after": { transition: "none" },
    },
  };
});
