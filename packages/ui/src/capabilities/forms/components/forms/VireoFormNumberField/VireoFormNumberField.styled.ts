import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  FilledInput,
  FormHelperText,
  Input,
  InputLabel,
  OutlinedInput,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_FORM_NUMBER_FIELD_NAME } from "./VireoFormNumberField.identity";
import { type VireoFormNumberFieldOwnerState } from "./VireoFormNumberField.types";

type VireoFormNumberFieldStyledSlotProps = StyledSlotProps<VireoFormNumberFieldOwnerState>;

export const VireoFormNumberFieldRoot = styled(TextField, {
  name: VIREO_FORM_NUMBER_FIELD_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.dirty && styles.dirty,
    ownerState.touched && styles.touched,
    ownerState.invalid && styles.invalid,
    ownerState.errorVisible && styles.errorVisible,
    ownerState.validating && styles.validating,
    ownerState.submitting && styles.submitting,
    ownerState.disabled && styles.disabled,
    ownerState.readOnly && styles.readOnly,
  ],
})<VireoFormNumberFieldStyledSlotProps>({}) as unknown as StyledSlotComponent<
  TextFieldProps,
  VireoFormNumberFieldOwnerState
>;

export const VireoFormNumberFieldInputLabel: React.ElementType = styled(InputLabel, {
  name: VIREO_FORM_NUMBER_FIELD_NAME,
  slot: "InputLabel",
  overridesResolver: (_props, styles) => styles.inputLabel,
})({});

export const VireoFormNumberFieldOutlinedInput: React.ElementType = styled(OutlinedInput, {
  name: VIREO_FORM_NUMBER_FIELD_NAME,
  slot: "Input",
  overridesResolver: (_props, styles) => styles.input,
})({});

export const VireoFormNumberFieldFilledInput: React.ElementType = styled(FilledInput, {
  name: VIREO_FORM_NUMBER_FIELD_NAME,
  slot: "Input",
  overridesResolver: (_props, styles) => styles.input,
})({});

export const VireoFormNumberFieldStandardInput: React.ElementType = styled(Input, {
  name: VIREO_FORM_NUMBER_FIELD_NAME,
  slot: "Input",
  overridesResolver: (_props, styles) => styles.input,
})({});

export const VireoFormNumberFieldFormHelperText: React.ElementType = styled(FormHelperText, {
  name: VIREO_FORM_NUMBER_FIELD_NAME,
  slot: "FormHelperText",
  overridesResolver: (_props, styles) => styles.formHelperText,
})({});
