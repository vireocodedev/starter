import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  Box,
  ListItemButton,
  Typography,
  type BoxProps,
  type ListItemButtonProps,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_APPLICATION_NAVIGATION_ITEM_NAME } from "./VireoApplicationNavigationItem.identity";
import { type VireoApplicationNavigationItemOwnerState } from "./VireoApplicationNavigationItem.types";

type VireoApplicationNavigationItemStyledSlotProps = StyledSlotProps<VireoApplicationNavigationItemOwnerState>;
type VireoApplicationNavigationItemStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoApplicationNavigationItemOwnerState
>;

export const VireoApplicationNavigationItemRoot: VireoApplicationNavigationItemStyledSlotComponent<ListItemButtonProps> =
  styled(ListItemButton, {
    name: VIREO_APPLICATION_NAVIGATION_ITEM_NAME,
    slot: "Root",
    overridesResolver: (_props, styles) => styles.root,
  })<VireoApplicationNavigationItemStyledSlotProps>(({ ownerState, theme }) => ({
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flex: "0 0 auto",
    flexDirection: ownerState.mode === "compact" ? "column" : "row",
    gap: ownerState.mode === "compact" ? theme.spacing(0.5) : theme.spacing(1.5),
    justifyContent: ownerState.mode === "compact" ? "center" : "flex-start",
    minHeight: ownerState.mode === "compact" ? 64 : 48,
    padding: ownerState.mode === "compact" ? theme.spacing(1, 0.5) : theme.spacing(1, 1.5),
    transition: theme.transitions.create(["background-color", "color", "padding"], {
      duration: theme.transitions.duration.shortest,
    }),
  }));

export const VireoApplicationNavigationItemIcon: VireoApplicationNavigationItemStyledSlotComponent<BoxProps> = styled(
  Box,
  {
    name: VIREO_APPLICATION_NAVIGATION_ITEM_NAME,
    slot: "Icon",
    overridesResolver: (_props, styles) => styles.icon,
  },
)<VireoApplicationNavigationItemStyledSlotProps>({
  alignItems: "center",
  color: "inherit",
  display: "inline-flex",
  flex: "0 0 auto",
  justifyContent: "center",
  minWidth: 24,
});

export const VireoApplicationNavigationItemLabel: VireoApplicationNavigationItemStyledSlotComponent<TypographyProps> =
  styled(Typography, {
    name: VIREO_APPLICATION_NAVIGATION_ITEM_NAME,
    slot: "Label",
    overridesResolver: (_props, styles) => styles.label,
  })<VireoApplicationNavigationItemStyledSlotProps>(({ ownerState }) => ({
    fontSize: ownerState.mode === "compact" ? "0.6875rem" : "0.875rem",
    fontWeight: ownerState.selected ? 700 : 500,
    lineHeight: ownerState.mode === "compact" ? 1.15 : 1.4,
    maxWidth: "100%",
    overflow: "hidden",
    textAlign: ownerState.mode === "compact" ? "center" : "start",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }));
