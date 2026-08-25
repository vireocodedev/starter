import { VIREO_MOTION_TOKENS, type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, Typography, type BoxProps, type TypographyProps } from "@mui/material";
import { keyframes, styled } from "@mui/material/styles";
import { VIREO_FORM_STEP_NAME } from "./VireoFormStep.identity";
import { type VireoFormStepOwnerState } from "./VireoFormStep.types";

type VireoFormStepStyledSlotProps = StyledSlotProps<VireoFormStepOwnerState>;
type VireoFormStepStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoFormStepOwnerState>;

const enterForward = keyframes({
  from: { opacity: 0, transform: `translateX(${VIREO_MOTION_TOKENS.distance.component}px)` },
  to: { opacity: 1, transform: "translateX(0)" },
});

const enterBackward = keyframes({
  from: { opacity: 0, transform: `translateX(-${VIREO_MOTION_TOKENS.distance.component}px)` },
  to: { opacity: 1, transform: "translateX(0)" },
});

export const VireoFormStepRoot: VireoFormStepStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_STEP_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFormStepStyledSlotProps>(({ ownerState }) => ({
  minWidth: 0,
  outline: 0,
  ...(ownerState.current && {
    animation: `${ownerState.direction === "forward" ? enterForward : enterBackward} ${VIREO_MOTION_TOKENS.duration.enter}ms ${VIREO_MOTION_TOKENS.easing.enter}`,
  }),
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
}));

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
