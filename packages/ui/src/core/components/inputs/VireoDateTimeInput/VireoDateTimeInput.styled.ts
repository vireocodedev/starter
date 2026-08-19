import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_DATE_TIME_INPUT_NAME } from "./VireoDateTimeInput.identity";
import { type VireoDateTimeInputOwnerState } from "./VireoDateTimeInput.types";

type VireoDateTimeInputStyledSlotProps = StyledSlotProps<VireoDateTimeInputOwnerState>;
type VireoDateTimeInputStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoDateTimeInputOwnerState
>;

export const VireoDateTimeInputRoot: VireoDateTimeInputStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_DATE_TIME_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoDateTimeInputStyledSlotProps>({ width: "100%" });
