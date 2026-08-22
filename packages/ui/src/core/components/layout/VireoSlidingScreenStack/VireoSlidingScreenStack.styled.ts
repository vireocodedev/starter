import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_SLIDING_SCREEN_STACK_NAME } from "./VireoSlidingScreenStack.identity";
import { type VireoSlidingScreenStackOwnerState } from "./VireoSlidingScreenStack.types";
type Owner = StyledSlotProps<VireoSlidingScreenStackOwnerState>;
type Slot = StyledSlotComponent<BoxProps, VireoSlidingScreenStackOwnerState>;

export const VireoSlidingScreenStackRoot: Slot = styled(Box, {
  name: VIREO_SLIDING_SCREEN_STACK_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<Owner>({ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" });

export const VireoSlidingScreenStackTrack: Slot = styled(Box, {
  name: VIREO_SLIDING_SCREEN_STACK_NAME,
  slot: "Track",
  overridesResolver: (_props, styles) => styles.track,
})<Owner>(({ ownerState, theme }) => ({
  display: "flex",
  flex: `0 0 ${ownerState.screenCount * 100}%`,
  width: `${ownerState.screenCount * 100}%`,
  maxWidth: `${ownerState.screenCount * 100}%`,
  height: "100%",
  minHeight: 0,
  transform: `translateX(-${(ownerState.activeScreenIndex * 100) / ownerState.screenCount}%)`,
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
}));

export const VireoSlidingScreenStackScreen: Slot = styled(Box, {
  name: VIREO_SLIDING_SCREEN_STACK_NAME,
  slot: "Screen",
  overridesResolver: (_props, styles) => styles.screen,
})<Owner>(({ ownerState }) => ({
  display: "flex",
  flex: `0 0 ${100 / ownerState.screenCount}%`,
  flexDirection: "column",
  maxWidth: `${100 / ownerState.screenCount}%`,
  minWidth: 0,
  minHeight: 0,
}));
