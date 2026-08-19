import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_DURATION_INPUT_NAME } from "./VireoDurationInput.identity";
import { type VireoDurationInputOwnerState } from "./VireoDurationInput.types";

type VireoDurationInputStyledSlotProps = StyledSlotProps<VireoDurationInputOwnerState>;
type VireoDurationInputStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoDurationInputOwnerState
>;

export const VireoDurationInputRoot: VireoDurationInputStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_DURATION_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoDurationInputStyledSlotProps>({ width: "100%" });
