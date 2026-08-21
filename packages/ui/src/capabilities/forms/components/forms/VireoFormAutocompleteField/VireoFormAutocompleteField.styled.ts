import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import Close from "@mui/icons-material/Close";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import {
  Box,
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
import { VIREO_FORM_AUTOCOMPLETE_FIELD_NAME } from "./VireoFormAutocompleteField.identity";
import type { VireoFormAutocompleteFieldOwnerState } from "./VireoFormAutocompleteField.types";

type StyledProps = StyledSlotProps<VireoFormAutocompleteFieldOwnerState>;
type StyledComponent<TProps extends object> = StyledSlotComponent<TProps, VireoFormAutocompleteFieldOwnerState>;
const options = (slot: string) => ({
  name: VIREO_FORM_AUTOCOMPLETE_FIELD_NAME,
  slot,
  overridesResolver: (_props: unknown, styles: Record<string, unknown>) =>
    styles[slot.charAt(0).toLowerCase() + slot.slice(1)] as never,
});

export const VireoFormAutocompleteFieldRoot: StyledComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_AUTOCOMPLETE_FIELD_NAME,
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
  ],
})<StyledProps>({ minWidth: 0 });

export const VireoFormAutocompleteFieldTextField: React.ElementType = styled(TextField, options("TextField"))({});
export const VireoFormAutocompleteFieldInputLabel: React.ElementType = styled(InputLabel, options("InputLabel"))({});
export const VireoFormAutocompleteFieldOutlinedInput: React.ElementType = styled(OutlinedInput, options("Input"))({});
export const VireoFormAutocompleteFieldFilledInput: React.ElementType = styled(FilledInput, options("Input"))({});
export const VireoFormAutocompleteFieldStandardInput: React.ElementType = styled(Input, options("Input"))({});
export const VireoFormAutocompleteFieldHtmlInput: React.ElementType = styled("input", options("HtmlInput"))({});
export const VireoFormAutocompleteFieldLoadingIndicator: React.ElementType = styled(
  CircularProgress,
  options("LoadingIndicator"),
)({});
export const VireoFormAutocompleteFieldClearButton: React.ElementType = styled(IconButton, options("ClearButton"))({});
export const VireoFormAutocompleteFieldClearIcon: React.ElementType = styled(Close, options("ClearIcon"))({});
export const VireoFormAutocompleteFieldPopupButton: React.ElementType = styled(IconButton, options("PopupButton"))({});
export const VireoFormAutocompleteFieldPopupIcon: React.ElementType = styled(ArrowDropDown, options("PopupIcon"))({});
export const VireoFormAutocompleteFieldFormHelperText: React.ElementType = styled(
  FormHelperText,
  options("FormHelperText"),
)({});
export const VireoFormAutocompleteFieldPopper: React.ElementType = styled(Popper, options("Popper"))({});
export const VireoFormAutocompleteFieldPaper: React.ElementType = styled(Paper, options("Paper"))({});
export const VireoFormAutocompleteFieldLoadingText: React.ElementType = styled("div", options("LoadingText"))({});
export const VireoFormAutocompleteFieldNoOptionsText: React.ElementType = styled("div", options("NoOptionsText"))({});
export const VireoFormAutocompleteFieldListbox: React.ElementType = styled("ul", options("Listbox"))({});
export const VireoFormAutocompleteFieldOption: React.ElementType = styled("li", options("Option"))({});
export const VireoFormAutocompleteFieldGroup: React.ElementType = styled("li", options("Group"))({ listStyle: "none" });
export const VireoFormAutocompleteFieldGroupLabel: React.ElementType = styled(ListSubheader, options("GroupLabel"))({});
export const VireoFormAutocompleteFieldGroupList: React.ElementType = styled(
  "ul",
  options("GroupList"),
)({ margin: 0, padding: 0 });
