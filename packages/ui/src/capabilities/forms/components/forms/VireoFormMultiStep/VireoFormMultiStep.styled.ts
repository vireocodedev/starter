import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_MULTI_STEP_NAME } from "./VireoFormMultiStep.identity";
import { type VireoFormMultiStepOwnerState } from "./VireoFormMultiStep.types";

type VireoFormMultiStepStyledSlotProps = StyledSlotProps<VireoFormMultiStepOwnerState>;
type VireoFormMultiStepStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormMultiStepOwnerState
>;

export const VireoFormMultiStepRoot: VireoFormMultiStepStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_MULTI_STEP_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFormMultiStepStyledSlotProps>({
  display: "flex",
  flexDirection: "column",
  gap: 24,
  minWidth: 0,
  width: "100%",
  containerType: "inline-size",
});
