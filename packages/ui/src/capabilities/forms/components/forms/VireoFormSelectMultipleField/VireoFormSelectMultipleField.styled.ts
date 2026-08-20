import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  Checkbox,
  FilledInput,
  FormHelperText,
  IconButton,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  type CheckboxProps,
  type FilledInputProps,
  type FormHelperTextProps,
  type IconButtonProps,
  type InputLabelProps,
  type InputProps,
  type MenuItemProps,
  type OutlinedInputProps,
  type TextFieldProps,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME } from "./VireoFormSelectMultipleField.identity";
import { type VireoFormSelectMultipleFieldOwnerState } from "./VireoFormSelectMultipleField.types";

type VireoFormSelectMultipleFieldStyledSlotProps = StyledSlotProps<VireoFormSelectMultipleFieldOwnerState>;
type VireoFormSelectMultipleFieldStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormSelectMultipleFieldOwnerState
>;

export const VireoFormSelectMultipleFieldRoot = styled(TextField, {
  name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
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
    ownerState.hasValue && styles.hasValue,
  ],
})<VireoFormSelectMultipleFieldStyledSlotProps>(
  {},
) as unknown as VireoFormSelectMultipleFieldStyledSlotComponent<TextFieldProps>;

export const VireoFormSelectMultipleFieldInputLabel: VireoFormSelectMultipleFieldStyledSlotComponent<InputLabelProps> =
  styled(InputLabel, {
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
    slot: "InputLabel",
    overridesResolver: (_props, styles) => styles.inputLabel,
  })<VireoFormSelectMultipleFieldStyledSlotProps>({});

export const VireoFormSelectMultipleFieldOutlinedInput: VireoFormSelectMultipleFieldStyledSlotComponent<OutlinedInputProps> =
  styled(OutlinedInput, {
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
    slot: "Input",
    overridesResolver: (_props, styles) => styles.input,
  })<VireoFormSelectMultipleFieldStyledSlotProps>({});

export const VireoFormSelectMultipleFieldFilledInput: VireoFormSelectMultipleFieldStyledSlotComponent<FilledInputProps> =
  styled(FilledInput, {
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
    slot: "Input",
    overridesResolver: (_props, styles) => styles.input,
  })<VireoFormSelectMultipleFieldStyledSlotProps>({});

export const VireoFormSelectMultipleFieldStandardInput: VireoFormSelectMultipleFieldStyledSlotComponent<InputProps> =
  styled(Input, {
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
    slot: "Input",
    overridesResolver: (_props, styles) => styles.input,
  })<VireoFormSelectMultipleFieldStyledSlotProps>({});

export const VireoFormSelectMultipleFieldSelect: React.ElementType = styled(Select, {
  name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
  slot: "Select",
  overridesResolver: (_props, styles) => styles.select,
})({});

export const VireoFormSelectMultipleFieldSelectionSummary: VireoFormSelectMultipleFieldStyledSlotComponent<TypographyProps> =
  styled(Typography, {
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
    slot: "SelectionSummary",
    overridesResolver: (_props, styles) => styles.selectionSummary,
  })<VireoFormSelectMultipleFieldStyledSlotProps>({
    display: "block",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  });

export const VireoFormSelectMultipleFieldOption: VireoFormSelectMultipleFieldStyledSlotComponent<MenuItemProps> =
  styled(MenuItem, {
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
    slot: "Option",
    overridesResolver: (_props, styles) => styles.option,
  })<VireoFormSelectMultipleFieldStyledSlotProps>({});

export const VireoFormSelectMultipleFieldOptionCheckbox: VireoFormSelectMultipleFieldStyledSlotComponent<CheckboxProps> =
  styled(Checkbox, {
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
    slot: "OptionCheckbox",
    overridesResolver: (_props, styles) => styles.optionCheckbox,
  })<VireoFormSelectMultipleFieldStyledSlotProps>({});

export const VireoFormSelectMultipleFieldOptionText: React.ElementType = styled(ListItemText, {
  name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
  slot: "OptionText",
  overridesResolver: (_props, styles) => styles.optionText,
})({});

export const VireoFormSelectMultipleFieldClearButton: VireoFormSelectMultipleFieldStyledSlotComponent<IconButtonProps> =
  styled(IconButton, {
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
    slot: "ClearButton",
    overridesResolver: (_props, styles) => styles.clearButton,
  })<VireoFormSelectMultipleFieldStyledSlotProps>({ marginInlineEnd: 20 });

export const VireoFormSelectMultipleFieldFormHelperText: VireoFormSelectMultipleFieldStyledSlotComponent<FormHelperTextProps> =
  styled(FormHelperText, {
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
    slot: "FormHelperText",
    overridesResolver: (_props, styles) => styles.formHelperText,
  })<VireoFormSelectMultipleFieldStyledSlotProps>({});
