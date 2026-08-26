import { VIREO_MOTION_TOKENS, type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, Drawer, type BoxProps, type DrawerProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_APPLICATION_NAVIGATION_NAME } from "./VireoApplicationNavigation.identity";
import { type VireoApplicationNavigationOwnerState } from "./VireoApplicationNavigation.types";

type VireoApplicationNavigationStyledSlotProps = StyledSlotProps<VireoApplicationNavigationOwnerState>;
type VireoApplicationNavigationStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoApplicationNavigationOwnerState
>;

export const VireoApplicationNavigationRoot: VireoApplicationNavigationStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_APPLICATION_NAVIGATION_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoApplicationNavigationStyledSlotProps>(({ ownerState }) => ({
  flex: "0 0 auto",
  height: "100%",
  minHeight: 0,
  position: "relative",
  width: ownerState.variant === "permanent" ? ownerState.width : 0,
  transition: ownerState.isResizing
    ? "none"
    : `width ${VIREO_MOTION_TOKENS.duration.standard}ms ${VIREO_MOTION_TOKENS.easing.standard}`,
}));

export const VireoApplicationNavigationSurface: VireoApplicationNavigationStyledSlotComponent<DrawerProps> = styled(
  Drawer,
  {
    name: VIREO_APPLICATION_NAVIGATION_NAME,
    slot: "Surface",
    overridesResolver: (_props, styles) => styles.surface,
  },
)<VireoApplicationNavigationStyledSlotProps>(({ ownerState, theme }) => ({
  width: ownerState.variant === "permanent" ? ownerState.width : "100%",
  maxWidth: ownerState.variant === "temporary" ? "100vw" : undefined,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    boxSizing: "border-box",
    position: ownerState.variant === "permanent" ? "absolute" : undefined,
    width: ownerState.width,
    maxWidth: ownerState.variant === "temporary" ? "100vw" : undefined,
    overflowX: "hidden",
    borderRight: `1px solid ${theme.palette.divider}`,
    transition: ownerState.isResizing
      ? "none"
      : theme.transitions.create("width", {
          duration: VIREO_MOTION_TOKENS.duration.standard,
          easing: VIREO_MOTION_TOKENS.easing.standard,
        }),
  },
}));

export const VireoApplicationNavigationContent: VireoApplicationNavigationStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_APPLICATION_NAVIGATION_NAME,
  slot: "Content",
  overridesResolver: (_props, styles) => styles.content,
})<VireoApplicationNavigationStyledSlotProps>({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  overflowX: "hidden",
  position: "relative",
});
