import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Button, type ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_RESET_BUTTON_NAME } from "./VireoFormResetButton.identity";
import { type VireoFormResetButtonOwnerState } from "./VireoFormResetButton.types";

type VireoFormResetButtonStyledSlotProps = StyledSlotProps<VireoFormResetButtonOwnerState>;
type VireoFormResetButtonStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormResetButtonOwnerState
>;

export const VireoFormResetButtonRoot: VireoFormResetButtonStyledSlotComponent<ButtonProps> = styled(Button, {
  name: VIREO_FORM_RESET_BUTTON_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.dirty && styles.dirty,
    ownerState.disabled && styles.disabled,
    ownerState.pristine && styles.pristine,
  ],
})<VireoFormResetButtonStyledSlotProps>({});
