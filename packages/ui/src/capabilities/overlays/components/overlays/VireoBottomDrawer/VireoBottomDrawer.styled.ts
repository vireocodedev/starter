import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, SwipeableDrawer, type BoxProps, type SwipeableDrawerProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_BOTTOM_DRAWER_NAME } from "./VireoBottomDrawer.identity";
import { type VireoBottomDrawerOwnerState } from "./VireoBottomDrawer.types";

type VireoBottomDrawerStyledSlotProps = StyledSlotProps<VireoBottomDrawerOwnerState>;
type VireoBottomDrawerStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoBottomDrawerOwnerState
>;

export const VireoBottomDrawerRoot: VireoBottomDrawerStyledSlotComponent<SwipeableDrawerProps> = styled(
  SwipeableDrawer,
  {
    name: VIREO_BOTTOM_DRAWER_NAME,
    slot: "Root",
    overridesResolver: (_props, styles) => styles.root,
  },
)<VireoBottomDrawerStyledSlotProps>({});

export const VireoBottomDrawerPuller: VireoBottomDrawerStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_BOTTOM_DRAWER_NAME,
  slot: "Puller",
  overridesResolver: (_props, styles) => styles.puller,
})<VireoBottomDrawerStyledSlotProps>(({ theme }) => ({
  flexShrink: 0,
  display: "flex",
  justifyContent: "center",
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(0.5),
  "&::after": {
    content: '""',
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.palette.grey[300],
  },
}));
