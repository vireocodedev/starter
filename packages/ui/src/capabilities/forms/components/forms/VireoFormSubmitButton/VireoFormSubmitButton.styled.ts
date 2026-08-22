import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Button, type ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_SUBMIT_BUTTON_NAME } from "./VireoFormSubmitButton.identity";
import { type VireoFormSubmitButtonOwnerState } from "./VireoFormSubmitButton.types";

type VireoFormSubmitButtonStyledSlotProps = StyledSlotProps<VireoFormSubmitButtonOwnerState>;
type VireoFormSubmitButtonStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormSubmitButtonOwnerState
>;

export const VireoFormSubmitButtonRoot: VireoFormSubmitButtonStyledSlotComponent<ButtonProps> = styled(Button, {
  name: VIREO_FORM_SUBMIT_BUTTON_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.disabled && styles.disabled,
    ownerState.loading && styles.loading,
    ownerState.submitting && styles.submitting,
  ],
})<VireoFormSubmitButtonStyledSlotProps>({});
