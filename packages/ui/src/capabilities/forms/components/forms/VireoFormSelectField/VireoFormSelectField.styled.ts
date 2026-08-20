import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
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
  type FilledInputProps,
  type FormHelperTextProps,
  type IconButtonProps,
  type InputLabelProps,
  type InputProps,
  type MenuItemProps,
  type OutlinedInputProps,
  type TextFieldProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_FORM_SELECT_FIELD_NAME } from "./VireoFormSelectField.identity";
import { type VireoFormSelectFieldOwnerState } from "./VireoFormSelectField.types";

type VireoFormSelectFieldStyledSlotProps = StyledSlotProps<VireoFormSelectFieldOwnerState>;
type VireoFormSelectFieldStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormSelectFieldOwnerState
>;

export const VireoFormSelectFieldRoot = styled(TextField, {
  name: VIREO_FORM_SELECT_FIELD_NAME,
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
})<VireoFormSelectFieldStyledSlotProps>({}) as unknown as VireoFormSelectFieldStyledSlotComponent<TextFieldProps>;

export const VireoFormSelectFieldInputLabel: VireoFormSelectFieldStyledSlotComponent<InputLabelProps> = styled(
  InputLabel,
  {
    name: VIREO_FORM_SELECT_FIELD_NAME,
    slot: "InputLabel",
    overridesResolver: (_props, styles) => styles.inputLabel,
  },
)<VireoFormSelectFieldStyledSlotProps>({});

export const VireoFormSelectFieldOutlinedInput: VireoFormSelectFieldStyledSlotComponent<OutlinedInputProps> = styled(
  OutlinedInput,
  {
    name: VIREO_FORM_SELECT_FIELD_NAME,
    slot: "Input",
    overridesResolver: (_props, styles) => styles.input,
  },
)<VireoFormSelectFieldStyledSlotProps>({});

export const VireoFormSelectFieldFilledInput: VireoFormSelectFieldStyledSlotComponent<FilledInputProps> = styled(
  FilledInput,
  {
    name: VIREO_FORM_SELECT_FIELD_NAME,
    slot: "Input",
    overridesResolver: (_props, styles) => styles.input,
  },
)<VireoFormSelectFieldStyledSlotProps>({});

export const VireoFormSelectFieldStandardInput: VireoFormSelectFieldStyledSlotComponent<InputProps> = styled(Input, {
  name: VIREO_FORM_SELECT_FIELD_NAME,
  slot: "Input",
  overridesResolver: (_props, styles) => styles.input,
})<VireoFormSelectFieldStyledSlotProps>({});

export const VireoFormSelectFieldSelect: React.ElementType = styled(Select, {
  name: VIREO_FORM_SELECT_FIELD_NAME,
  slot: "Select",
  overridesResolver: (_props, styles) => styles.select,
})({});

export const VireoFormSelectFieldOption: VireoFormSelectFieldStyledSlotComponent<MenuItemProps> = styled(MenuItem, {
  name: VIREO_FORM_SELECT_FIELD_NAME,
  slot: "Option",
  overridesResolver: (_props, styles) => styles.option,
})<VireoFormSelectFieldStyledSlotProps>({});

export const VireoFormSelectFieldOptionText: React.ElementType = styled(ListItemText, {
  name: VIREO_FORM_SELECT_FIELD_NAME,
  slot: "OptionText",
  overridesResolver: (_props, styles) => styles.optionText,
})({});

export const VireoFormSelectFieldClearButton: VireoFormSelectFieldStyledSlotComponent<IconButtonProps> = styled(
  IconButton,
  {
    name: VIREO_FORM_SELECT_FIELD_NAME,
    slot: "ClearButton",
    overridesResolver: (_props, styles) => styles.clearButton,
  },
)<VireoFormSelectFieldStyledSlotProps>({ marginInlineEnd: -4 });

export const VireoFormSelectFieldFormHelperText: VireoFormSelectFieldStyledSlotComponent<FormHelperTextProps> = styled(
  FormHelperText,
  {
    name: VIREO_FORM_SELECT_FIELD_NAME,
    slot: "FormHelperText",
    overridesResolver: (_props, styles) => styles.formHelperText,
  },
)<VireoFormSelectFieldStyledSlotProps>({});
