import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  type BottomNavigationActionProps,
  type BottomNavigationProps,
  type BoxProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_MOBILE_BOTTOM_NAVIGATION_NAME } from "./VireoMobileBottomNavigation.identity";
import { type VireoMobileBottomNavigationOwnerState } from "./VireoMobileBottomNavigation.types";

type VireoMobileBottomNavigationStyledSlotProps = StyledSlotProps<VireoMobileBottomNavigationOwnerState>;
type VireoMobileBottomNavigationStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoMobileBottomNavigationOwnerState
>;

export const VireoMobileBottomNavigationRoot: VireoMobileBottomNavigationStyledSlotComponent<BoxProps<"nav">> = styled(
  Box,
  {
    name: VIREO_MOBILE_BOTTOM_NAVIGATION_NAME,
    slot: "Root",
    overridesResolver: (_props, styles) => styles.root,
  },
)<VireoMobileBottomNavigationStyledSlotProps>(({ ownerState, theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "block",
  flex: "0 0 auto",
  minWidth: 0,
  paddingBottom: ownerState.safeAreaInset ? "env(safe-area-inset-bottom, 0px)" : 0,
  width: "100%",
}));

export const VireoMobileBottomNavigationNavigation: VireoMobileBottomNavigationStyledSlotComponent<BottomNavigationProps> =
  styled(BottomNavigation, {
    name: VIREO_MOBILE_BOTTOM_NAVIGATION_NAME,
    slot: "Navigation",
    overridesResolver: (_props, styles) => styles.navigation,
  })<VireoMobileBottomNavigationStyledSlotProps>({
    backgroundColor: "transparent",
    height: 64,
    minWidth: 0,
    width: "100%",
  });

export const VireoMobileBottomNavigationAction: VireoMobileBottomNavigationStyledSlotComponent<BottomNavigationActionProps> =
  styled(BottomNavigationAction, {
    name: VIREO_MOBILE_BOTTOM_NAVIGATION_NAME,
    slot: "Action",
    overridesResolver: (_props, styles) => styles.action,
  })<VireoMobileBottomNavigationStyledSlotProps>({
    minWidth: 0,
    overflow: "hidden",
    paddingInline: 4,
    "& .MuiBottomNavigationAction-label": {
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  });
