import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import Cancel from "@mui/icons-material/Cancel";
import Close from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FilledInput,
  FormHelperText,
  IconButton,
  Input,
  InputLabel,
  ListSubheader,
  OutlinedInput,
  Paper,
  Popper,
  TextField,
  type BoxProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_NAME } from "./VireoFormAutocompleteMultipleField.identity";
import type { VireoFormAutocompleteMultipleFieldOwnerState } from "./VireoFormAutocompleteMultipleField.types";
type StyledProps = StyledSlotProps<VireoFormAutocompleteMultipleFieldOwnerState>;
type StyledComponent<TProps extends object> = StyledSlotComponent<TProps, VireoFormAutocompleteMultipleFieldOwnerState>;
const options = (slot: string) => ({
  name: VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_NAME,
  slot,
  overridesResolver: (_props: unknown, styles: Record<string, unknown>) =>
    styles[slot.charAt(0).toLowerCase() + slot.slice(1)] as never,
});
export const VireoFormAutocompleteMultipleFieldRoot: StyledComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.disabled && styles.disabled,
    ownerState.readOnly && styles.readOnly,
    ownerState.required && styles.required,
    ownerState.error && styles.error,
    ownerState.focused && styles.focused,
    ownerState.dirty && styles.dirty,
    ownerState.touched && styles.touched,
    ownerState.submitting && styles.submitting,
    ownerState.validating && styles.validating,
    ownerState.open && styles.open,
    ownerState.loading && styles.loading,
    ownerState.hasValue && styles.hasValue,
    ownerState.hasInputValue && styles.hasInputValue,
    ownerState.hasUnresolvedValue && styles.hasUnresolvedValue,
    ownerState.atSelectionLimit && styles.atSelectionLimit,
    ownerState.hasHiddenOptions && styles.hasHiddenOptions,
  ],
})<StyledProps>({ minWidth: 0 });
export const VireoFormAutocompleteMultipleFieldTextField: React.ElementType = styled(
  TextField,
  options("TextField"),
)({});
export const VireoFormAutocompleteMultipleFieldInputLabel: React.ElementType = styled(
  InputLabel,
  options("InputLabel"),
)({});
export const VireoFormAutocompleteMultipleFieldOutlinedInput: React.ElementType = styled(
  OutlinedInput,
  options("Input"),
)({});
export const VireoFormAutocompleteMultipleFieldFilledInput: React.ElementType = styled(
  FilledInput,
  options("Input"),
)({});
export const VireoFormAutocompleteMultipleFieldStandardInput: React.ElementType = styled(Input, options("Input"))({});
export const VireoFormAutocompleteMultipleFieldHtmlInput: React.ElementType = styled("input", options("HtmlInput"))({});
export const VireoFormAutocompleteMultipleFieldLoadingIndicator: React.ElementType = styled(
  CircularProgress,
  options("LoadingIndicator"),
)({});
export const VireoFormAutocompleteMultipleFieldClearButton: React.ElementType = styled(
  IconButton,
  options("ClearButton"),
)({});
export const VireoFormAutocompleteMultipleFieldClearIcon: React.ElementType = styled(Close, options("ClearIcon"))({});
export const VireoFormAutocompleteMultipleFieldPopupButton: React.ElementType = styled(
  IconButton,
  options("PopupButton"),
)({});
export const VireoFormAutocompleteMultipleFieldPopupIcon: React.ElementType = styled(
  ArrowDropDown,
  options("PopupIcon"),
)({});
export const VireoFormAutocompleteMultipleFieldFormHelperText: React.ElementType = styled(
  FormHelperText,
  options("FormHelperText"),
)({});
export const VireoFormAutocompleteMultipleFieldPopper: React.ElementType = styled(Popper, options("Popper"))({});
export const VireoFormAutocompleteMultipleFieldPaper: React.ElementType = styled(Paper, options("Paper"))({});
export const VireoFormAutocompleteMultipleFieldLoadingText: React.ElementType = styled(
  "div",
  options("LoadingText"),
)({});
export const VireoFormAutocompleteMultipleFieldNoOptionsText: React.ElementType = styled(
  "div",
  options("NoOptionsText"),
)({});
export const VireoFormAutocompleteMultipleFieldListbox: React.ElementType = styled("ul", options("Listbox"))({});
export const VireoFormAutocompleteMultipleFieldOption: React.ElementType = styled("li", options("Option"))({});
export const VireoFormAutocompleteMultipleFieldGroup: React.ElementType = styled(
  "li",
  options("Group"),
)({ listStyle: "none" });
export const VireoFormAutocompleteMultipleFieldGroupLabel: React.ElementType = styled(
  ListSubheader,
  options("GroupLabel"),
)({});
export const VireoFormAutocompleteMultipleFieldGroupList: React.ElementType = styled(
  "ul",
  options("GroupList"),
)({ margin: 0, padding: 0 });
export const VireoFormAutocompleteMultipleFieldSelectedOptions: React.ElementType = styled(
  "div",
  options("SelectedOptions"),
)({ display: "flex", minWidth: 0, overflow: "hidden", gap: 4, flexWrap: "nowrap" });
export const VireoFormAutocompleteMultipleFieldSelectedOption: React.ElementType = styled(
  Chip,
  options("SelectedOption"),
)({ minWidth: 0, maxWidth: 180, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } });
export const VireoFormAutocompleteMultipleFieldSelectedOptionDeleteIcon: React.ElementType = styled(
  Cancel,
  options("SelectedOptionDeleteIcon"),
)({});
export const VireoFormAutocompleteMultipleFieldHiddenOptionsButton: React.ElementType = styled(
  Button,
  options("HiddenOptionsButton"),
)({ minWidth: 0, flexShrink: 0 });
export const VireoFormAutocompleteMultipleFieldOptionCheckbox: React.ElementType = styled(
  Checkbox,
  options("OptionCheckbox"),
)({ marginRight: 8 });
