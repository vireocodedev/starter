import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  Alert,
  Box,
  ButtonBase,
  Typography,
  type AlertProps,
  type BoxProps,
  type ButtonBaseProps,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_ERROR_SUMMARY_NAME } from "./VireoFormErrorSummary.identity";
import { type VireoFormErrorSummaryOwnerState } from "./VireoFormErrorSummary.types";

type VireoFormErrorSummaryStyledSlotProps = StyledSlotProps<VireoFormErrorSummaryOwnerState>;
type VireoFormErrorSummaryStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormErrorSummaryOwnerState
>;

export const VireoFormErrorSummaryRoot: VireoFormErrorSummaryStyledSlotComponent<AlertProps> = styled(Alert, {
  name: VIREO_FORM_ERROR_SUMMARY_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFormErrorSummaryStyledSlotProps>({});

export const VireoFormErrorSummaryIcon: VireoFormErrorSummaryStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_ERROR_SUMMARY_NAME,
  slot: "Icon",
  overridesResolver: (_props, styles) => styles.icon,
})<VireoFormErrorSummaryStyledSlotProps>(({ theme }) => ({ fontWeight: theme.typography.fontWeightBold }));
export const VireoFormErrorSummaryContent: VireoFormErrorSummaryStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_ERROR_SUMMARY_NAME,
  slot: "Content",
  overridesResolver: (_props, styles) => styles.content,
})<VireoFormErrorSummaryStyledSlotProps>({ width: "100%" });
export const VireoFormErrorSummaryTitle: VireoFormErrorSummaryStyledSlotComponent<TypographyProps> = styled(
  Typography,
  { name: VIREO_FORM_ERROR_SUMMARY_NAME, slot: "Title", overridesResolver: (_props, styles) => styles.title },
)<VireoFormErrorSummaryStyledSlotProps>(({ theme }) => ({ fontWeight: theme.typography.fontWeightBold }));
export const VireoFormErrorSummaryGroup: VireoFormErrorSummaryStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_ERROR_SUMMARY_NAME,
  slot: "Group",
  overridesResolver: (_props, styles) => styles.group,
})<VireoFormErrorSummaryStyledSlotProps>(({ theme }) => ({ marginTop: theme.spacing(1) }));
export const VireoFormErrorSummaryGroupLabel: VireoFormErrorSummaryStyledSlotComponent<TypographyProps> = styled(
  Typography,
  { name: VIREO_FORM_ERROR_SUMMARY_NAME, slot: "GroupLabel", overridesResolver: (_props, styles) => styles.groupLabel },
)<VireoFormErrorSummaryStyledSlotProps>(({ theme }) => ({ fontWeight: theme.typography.fontWeightMedium }));
export const VireoFormErrorSummaryList: VireoFormErrorSummaryStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_ERROR_SUMMARY_NAME,
  slot: "List",
  overridesResolver: (_props, styles) => styles.list,
})<VireoFormErrorSummaryStyledSlotProps>(({ theme }) => ({ margin: 0, paddingInlineStart: theme.spacing(2.5) }));
export const VireoFormErrorSummaryItem: VireoFormErrorSummaryStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_ERROR_SUMMARY_NAME,
  slot: "Item",
  overridesResolver: (_props, styles) => styles.item,
})<VireoFormErrorSummaryStyledSlotProps>({});
export const VireoFormErrorSummaryItemButton: VireoFormErrorSummaryStyledSlotComponent<ButtonBaseProps> = styled(
  ButtonBase,
  { name: VIREO_FORM_ERROR_SUMMARY_NAME, slot: "ItemButton", overridesResolver: (_props, styles) => styles.itemButton },
)<VireoFormErrorSummaryStyledSlotProps>(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  color: "inherit",
  textAlign: "start",
  textDecoration: "underline",
}));
