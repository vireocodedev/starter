import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Button, CircularProgress, type ButtonProps, type CircularProgressProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_NEXT_STEP_BUTTON_NAME } from "./VireoFormNextStepButton.identity";
import { type VireoFormNextStepButtonOwnerState } from "./VireoFormNextStepButton.types";

type VireoFormNextStepButtonStyledSlotProps = StyledSlotProps<VireoFormNextStepButtonOwnerState>;
type VireoFormNextStepButtonStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormNextStepButtonOwnerState
>;

export const VireoFormNextStepButtonRoot: VireoFormNextStepButtonStyledSlotComponent<ButtonProps> = styled(Button, {
  name: VIREO_FORM_NEXT_STEP_BUTTON_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.disabled && styles.disabled,
    ownerState.loading && styles.loading,
    ownerState.lastStep && styles.lastStep,
  ],
})<VireoFormNextStepButtonStyledSlotProps>({});

export const VireoFormNextStepButtonLoadingIndicator: VireoFormNextStepButtonStyledSlotComponent<CircularProgressProps> =
  styled(CircularProgress, {
    name: VIREO_FORM_NEXT_STEP_BUTTON_NAME,
    slot: "LoadingIndicator",
    overridesResolver: (_props, styles) => styles.loadingIndicator,
  })<VireoFormNextStepButtonStyledSlotProps>({ color: "inherit" });
