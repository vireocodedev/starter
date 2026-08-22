import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_STATUS_DOT_NAME } from "./VireoStatusDot.identity";
import { type VireoStatusDotOwnerState } from "./VireoStatusDot.types";

type VireoStatusDotStyledSlotProps = StyledSlotProps<VireoStatusDotOwnerState>;
type VireoStatusDotStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoStatusDotOwnerState>;

export const VireoStatusDotRoot: VireoStatusDotStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_STATUS_DOT_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [styles.root, ownerState.selected && styles.selected],
})<VireoStatusDotStyledSlotProps>(({ theme, ownerState }) => ({
  backgroundColor: ownerState.selected
    ? theme.palette.common.white
    : ownerState.color === "standard"
      ? theme.palette.text.primary
      : theme.palette[ownerState.color].main,
  borderRadius: "50%",
  display: "inline-block",
  flex: "0 0 auto",
  height: ownerState.size,
  width: ownerState.size,
}));
