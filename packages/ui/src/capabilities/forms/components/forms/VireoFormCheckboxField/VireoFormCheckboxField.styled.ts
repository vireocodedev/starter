import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  FormControl,
  FormControlLabel,
  type FormControlLabelProps,
  type FormControlProps,
  FormHelperText,
  type FormHelperTextProps,
  Checkbox,
  type CheckboxProps,
  Typography,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_CHECKBOX_FIELD_NAME } from "./VireoFormCheckboxField.identity";
import { type VireoFormCheckboxFieldOwnerState } from "./VireoFormCheckboxField.types";

type VireoFormCheckboxFieldStyledSlotProps = StyledSlotProps<VireoFormCheckboxFieldOwnerState>;
type VireoFormCheckboxFieldStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormCheckboxFieldOwnerState
>;

export const VireoFormCheckboxFieldRoot: VireoFormCheckboxFieldStyledSlotComponent<FormControlProps> = styled(
  FormControl,
  {
    name: VIREO_FORM_CHECKBOX_FIELD_NAME,
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
  },
)<VireoFormCheckboxFieldStyledSlotProps>({});

export const VireoFormCheckboxFieldFormControlLabel: VireoFormCheckboxFieldStyledSlotComponent<FormControlLabelProps> =
  styled(FormControlLabel, {
    name: VIREO_FORM_CHECKBOX_FIELD_NAME,
    slot: "FormControlLabel",
    overridesResolver: (_props, styles) => styles.formControlLabel,
  })<VireoFormCheckboxFieldStyledSlotProps>({});

export const VireoFormCheckboxFieldCheckbox: VireoFormCheckboxFieldStyledSlotComponent<CheckboxProps> = styled(
  Checkbox,
  {
    name: VIREO_FORM_CHECKBOX_FIELD_NAME,
    slot: "Checkbox",
    overridesResolver: (_props, styles) => styles.checkbox,
  },
)<VireoFormCheckboxFieldStyledSlotProps>({});

export const VireoFormCheckboxFieldLabel: VireoFormCheckboxFieldStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_FORM_CHECKBOX_FIELD_NAME,
    slot: "Label",
    overridesResolver: (_props, styles) => styles.label,
  },
)<VireoFormCheckboxFieldStyledSlotProps>({});

export const VireoFormCheckboxFieldFormHelperText: VireoFormCheckboxFieldStyledSlotComponent<FormHelperTextProps> =
  styled(FormHelperText, {
    name: VIREO_FORM_CHECKBOX_FIELD_NAME,
    slot: "FormHelperText",
    overridesResolver: (_props, styles) => styles.formHelperText,
  })<VireoFormCheckboxFieldStyledSlotProps>({});
