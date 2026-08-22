import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Button, type ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME } from "./VireoFormPreviousStepButton.identity";
import { type VireoFormPreviousStepButtonOwnerState } from "./VireoFormPreviousStepButton.types";

type VireoFormPreviousStepButtonStyledSlotProps = StyledSlotProps<VireoFormPreviousStepButtonOwnerState>;
type VireoFormPreviousStepButtonStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormPreviousStepButtonOwnerState
>;

export const VireoFormPreviousStepButtonRoot: VireoFormPreviousStepButtonStyledSlotComponent<ButtonProps> = styled(
  Button,
  {
    name: VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME,
    slot: "Root",
    overridesResolver: ({ ownerState }, styles) => [
      styles.root,
      ownerState.disabled && styles.disabled,
      ownerState.firstStep && styles.firstStep,
    ],
  },
)<VireoFormPreviousStepButtonStyledSlotProps>({});
