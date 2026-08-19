import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  FilledInput,
  FormHelperText,
  Input,
  InputLabel,
  OutlinedInput,
  Select,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_FORM_TEXT_FIELD_NAME } from "./VireoFormTextField.identity";
import { type VireoFormTextFieldOwnerState } from "./VireoFormTextField.types";

type VireoFormTextFieldStyledSlotProps = StyledSlotProps<VireoFormTextFieldOwnerState>;

export const VireoFormTextFieldRoot = styled(TextField, {
  name: VIREO_FORM_TEXT_FIELD_NAME,
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
})<VireoFormTextFieldStyledSlotProps>({}) as unknown as StyledSlotComponent<
  TextFieldProps,
  VireoFormTextFieldOwnerState
>;

export const VireoFormTextFieldInputLabel: React.ElementType = styled(InputLabel, {
  name: VIREO_FORM_TEXT_FIELD_NAME,
  slot: "InputLabel",
  overridesResolver: (_props, styles) => styles.inputLabel,
})({});

export const VireoFormTextFieldOutlinedInput: React.ElementType = styled(OutlinedInput, {
  name: VIREO_FORM_TEXT_FIELD_NAME,
  slot: "Input",
  overridesResolver: (_props, styles) => styles.input,
})({});

export const VireoFormTextFieldFilledInput: React.ElementType = styled(FilledInput, {
  name: VIREO_FORM_TEXT_FIELD_NAME,
  slot: "Input",
  overridesResolver: (_props, styles) => styles.input,
})({});

export const VireoFormTextFieldStandardInput: React.ElementType = styled(Input, {
  name: VIREO_FORM_TEXT_FIELD_NAME,
  slot: "Input",
  overridesResolver: (_props, styles) => styles.input,
})({});

export const VireoFormTextFieldHtmlInput: React.ElementType = styled("input", {
  name: VIREO_FORM_TEXT_FIELD_NAME,
  slot: "HtmlInput",
  overridesResolver: (_props, styles) => styles.htmlInput,
})({});

export const VireoFormTextFieldFormHelperText: React.ElementType = styled(FormHelperText, {
  name: VIREO_FORM_TEXT_FIELD_NAME,
  slot: "FormHelperText",
  overridesResolver: (_props, styles) => styles.formHelperText,
})({});

export const VireoFormTextFieldSelect: React.ElementType = styled(Select, {
  name: VIREO_FORM_TEXT_FIELD_NAME,
  slot: "Select",
  overridesResolver: (_props, styles) => styles.select,
})({});
