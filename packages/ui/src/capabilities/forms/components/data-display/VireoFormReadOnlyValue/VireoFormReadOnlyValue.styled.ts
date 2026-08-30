import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, Typography, type BoxProps, type TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_READ_ONLY_VALUE_NAME } from "./VireoFormReadOnlyValue.identity";
import { type VireoFormReadOnlyValueOwnerState } from "./VireoFormReadOnlyValue.types";

type VireoFormReadOnlyValueStyledSlotProps = StyledSlotProps<VireoFormReadOnlyValueOwnerState>;
type VireoFormReadOnlyValueStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormReadOnlyValueOwnerState
>;

export const VireoFormReadOnlyValueRoot: VireoFormReadOnlyValueStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_READ_ONLY_VALUE_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFormReadOnlyValueStyledSlotProps>(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(0.5),
  minWidth: 0,
}));

export const VireoFormReadOnlyValueLabel: VireoFormReadOnlyValueStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_FORM_READ_ONLY_VALUE_NAME,
    slot: "Label",
    overridesResolver: (_props, styles) => styles.label,
  },
)<VireoFormReadOnlyValueStyledSlotProps>(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const VireoFormReadOnlyValueValue: VireoFormReadOnlyValueStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_FORM_READ_ONLY_VALUE_NAME,
    slot: "Value",
    overridesResolver: (props, styles) => [styles.value, props.ownerState.empty && styles.empty],
  },
)<VireoFormReadOnlyValueStyledSlotProps>(({ ownerState, theme }) => ({
  color: ownerState.empty ? theme.palette.text.secondary : theme.palette.text.primary,
  minWidth: 0,
  overflowWrap: "anywhere",
  whiteSpace: "pre-wrap",
}));
