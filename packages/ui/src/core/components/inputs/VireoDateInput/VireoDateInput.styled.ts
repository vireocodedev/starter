import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_DATE_INPUT_NAME } from "./VireoDateInput.identity";
import { type VireoDateInputOwnerState } from "./VireoDateInput.types";

type VireoDateInputStyledSlotProps = StyledSlotProps<VireoDateInputOwnerState>;
type VireoDateInputStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoDateInputOwnerState>;

export const VireoDateInputRoot: VireoDateInputStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_DATE_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoDateInputStyledSlotProps>({ width: "100%" });
