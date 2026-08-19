import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_TIME_INPUT_NAME } from "./VireoTimeInput.identity";
import { type VireoTimeInputOwnerState } from "./VireoTimeInput.types";

type VireoTimeInputStyledSlotProps = StyledSlotProps<VireoTimeInputOwnerState>;
type VireoTimeInputStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoTimeInputOwnerState>;

export const VireoTimeInputRoot: VireoTimeInputStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_TIME_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoTimeInputStyledSlotProps>({ width: "100%" });
