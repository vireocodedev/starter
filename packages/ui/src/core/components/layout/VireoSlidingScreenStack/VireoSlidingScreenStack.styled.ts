import { VIREO_MOTION_TOKENS, VIREO_REDUCED_MOTION_MEDIA_QUERY } from "@/core/constants/motion.constants";
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
})<Owner>({ display: "flex", flex: 1, maxWidth: "100%", minHeight: 0, minWidth: 0, overflow: "hidden", width: "100%" });

export const VireoSlidingScreenStackTrack: Slot = styled(Box, {
  name: VIREO_SLIDING_SCREEN_STACK_NAME,
  slot: "Track",
  overridesResolver: (_props, styles) => styles.track,
})<Owner>({
  display: "grid",
  flex: "1 1 auto",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "100%",
  height: "100%",
  minHeight: 0,
  minWidth: 0,
});

export const VireoSlidingScreenStackScreen: Slot = styled(Box, {
  name: VIREO_SLIDING_SCREEN_STACK_NAME,
  slot: "Screen",
  overridesResolver: (_props, styles) => styles.screen,
})<Owner>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gridArea: "1 / 1",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  minHeight: 0,
  transition: theme.transitions.create("transform", {
    duration: VIREO_MOTION_TOKENS.duration.standard,
    easing: VIREO_MOTION_TOKENS.easing.standard,
  }),
  [VIREO_REDUCED_MOTION_MEDIA_QUERY]: { transition: "none" },
}));
