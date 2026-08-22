import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, Typography, type BoxProps, type TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_STEP_NAME } from "./VireoFormStep.identity";
import { type VireoFormStepOwnerState } from "./VireoFormStep.types";

type VireoFormStepStyledSlotProps = StyledSlotProps<VireoFormStepOwnerState>;
type VireoFormStepStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoFormStepOwnerState>;

export const VireoFormStepRoot: VireoFormStepStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_STEP_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFormStepStyledSlotProps>({ minWidth: 0, outline: 0 });

export const VireoFormStepLabel: VireoFormStepStyledSlotComponent<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_STEP_NAME,
  slot: "Label",
  overridesResolver: (_props, styles) => styles.label,
})<VireoFormStepStyledSlotProps>({
  border: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});
