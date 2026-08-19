import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps, Typography, type TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_SNACK_NAME } from "./VireoSnack.identity";
import { type VireoSnackOwnerState } from "./VireoSnack.types";

type VireoSnackStyledSlotProps = StyledSlotProps<VireoSnackOwnerState>;
type VireoSnackStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoSnackOwnerState>;

export const VireoSnackRoot: VireoSnackStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_SNACK_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoSnackStyledSlotProps>(({ ownerState, theme }) => {
  const backgroundColor =
    ownerState.variant === "default" ? theme.palette.background.paper : theme.palette[ownerState.variant].main;
  const color =
    ownerState.variant === "default" ? theme.palette.text.primary : theme.palette[ownerState.variant].contrastText;
  return {
    display: "flex",
    alignItems: "center",
    flexWrap: "nowrap",
    gap: theme.spacing(1),
    minWidth: 240,
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor,
    color,
  };
});

const adornmentStyles = { display: "inline-flex", alignItems: "center", flex: "0 0 auto" } as const;

export const VireoSnackStartAdornment: VireoSnackStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_SNACK_NAME,
  slot: "StartAdornment",
  overridesResolver: (_props, styles) => styles.startAdornment,
})<VireoSnackStyledSlotProps>(adornmentStyles);

export const VireoSnackMessage: VireoSnackStyledSlotComponent<TypographyProps> = styled(Typography, {
  name: VIREO_SNACK_NAME,
  slot: "Message",
  overridesResolver: (_props, styles) => styles.message,
})<VireoSnackStyledSlotProps>({ flex: "1 1 auto", minWidth: 0 });

export const VireoSnackEndAdornment: VireoSnackStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_SNACK_NAME,
  slot: "EndAdornment",
  overridesResolver: (_props, styles) => styles.endAdornment,
})<VireoSnackStyledSlotProps>(adornmentStyles);
