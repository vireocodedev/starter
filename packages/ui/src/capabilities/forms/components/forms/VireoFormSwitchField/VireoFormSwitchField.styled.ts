import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  FormControl,
  FormControlLabel,
  type FormControlLabelProps,
  type FormControlProps,
  FormHelperText,
  type FormHelperTextProps,
  Switch,
  type SwitchProps,
  Typography,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_SWITCH_FIELD_NAME } from "./VireoFormSwitchField.identity";
import { type VireoFormSwitchFieldOwnerState } from "./VireoFormSwitchField.types";

type VireoFormSwitchFieldStyledSlotProps = StyledSlotProps<VireoFormSwitchFieldOwnerState>;
type VireoFormSwitchFieldStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormSwitchFieldOwnerState
>;

export const VireoFormSwitchFieldRoot: VireoFormSwitchFieldStyledSlotComponent<FormControlProps> = styled(FormControl, {
  name: VIREO_FORM_SWITCH_FIELD_NAME,
  slot: "Root",
  overridesResolver: (props, styles) => [
    styles.root,
    props.ownerState.checked && styles.checked,
    props.ownerState.dirty && styles.dirty,
    props.ownerState.touched && styles.touched,
    props.ownerState.invalid && styles.invalid,
    props.ownerState.errorVisible && styles.errorVisible,
    props.ownerState.validating && styles.validating,
    props.ownerState.submitting && styles.submitting,
    props.ownerState.disabled && styles.disabled,
  ],
})<VireoFormSwitchFieldStyledSlotProps>({});

export const VireoFormSwitchFieldFormControlLabel: VireoFormSwitchFieldStyledSlotComponent<FormControlLabelProps> =
  styled(FormControlLabel, {
    name: VIREO_FORM_SWITCH_FIELD_NAME,
    slot: "FormControlLabel",
    overridesResolver: (_props, styles) => styles.formControlLabel,
  })<VireoFormSwitchFieldStyledSlotProps>({});

export const VireoFormSwitchFieldSwitch: VireoFormSwitchFieldStyledSlotComponent<SwitchProps> = styled(Switch, {
  name: VIREO_FORM_SWITCH_FIELD_NAME,
  slot: "Switch",
  overridesResolver: (_props, styles) => styles.switch,
})<VireoFormSwitchFieldStyledSlotProps>({});

export const VireoFormSwitchFieldLabel: VireoFormSwitchFieldStyledSlotComponent<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_SWITCH_FIELD_NAME,
  slot: "Label",
  overridesResolver: (_props, styles) => styles.label,
})<VireoFormSwitchFieldStyledSlotProps>({});

export const VireoFormSwitchFieldFormHelperText: VireoFormSwitchFieldStyledSlotComponent<FormHelperTextProps> = styled(
  FormHelperText,
  {
    name: VIREO_FORM_SWITCH_FIELD_NAME,
    slot: "FormHelperText",
    overridesResolver: (_props, styles) => styles.formHelperText,
  },
)<VireoFormSwitchFieldStyledSlotProps>({});
