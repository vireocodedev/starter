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
  type PaperProps,
  type PopperProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
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
const VireoFormAutocompleteMultipleFieldStyledPopper = styled(
  Popper,
  options("Popper"),
)(({ theme }) => ({ zIndex: theme.zIndex.modal }));
const VireoFormAutocompleteMultipleFieldStyledPaper = styled(
  Paper,
  options("Paper"),
)(({ theme }) => ({ ...theme.typography.body1, overflow: "auto" }));
type PopperSlotProps = PopperProps & StyledProps;
type PaperSlotProps = PaperProps & StyledProps;
export const VireoFormAutocompleteMultipleFieldPopper = React.forwardRef<HTMLDivElement, PopperSlotProps>(
  function VireoFormAutocompleteMultipleFieldPopper(props, ref) {
    return React.createElement(VireoFormAutocompleteMultipleFieldStyledPopper, { ...props, ref });
  },
);
export const VireoFormAutocompleteMultipleFieldPaper = React.forwardRef<HTMLDivElement, PaperSlotProps>(
  function VireoFormAutocompleteMultipleFieldPaper(props, ref) {
    return React.createElement(VireoFormAutocompleteMultipleFieldStyledPaper, { ...props, ref });
  },
);
export const VireoFormAutocompleteMultipleFieldLoadingText: React.ElementType = styled(
  "div",
  options("LoadingText"),
)({});
export const VireoFormAutocompleteMultipleFieldNoOptionsText: React.ElementType = styled(
  "div",
  options("NoOptionsText"),
)({});
const VireoFormAutocompleteMultipleFieldStyledListbox = styled(
  "ul",
  options("Listbox"),
)({
  listStyle: "none",
  margin: 0,
  maxHeight: "40vh",
  overflow: "auto",
  padding: "8px 0",
  position: "relative",
});
type ListboxSlotProps = React.HTMLAttributes<HTMLUListElement> & StyledProps;
export const VireoFormAutocompleteMultipleFieldListbox = React.forwardRef<HTMLUListElement, ListboxSlotProps>(
  function VireoFormAutocompleteMultipleFieldListbox(props, ref) {
    return React.createElement(VireoFormAutocompleteMultipleFieldStyledListbox, { ...props, ref });
  },
);
export const VireoFormAutocompleteMultipleFieldOption: React.ElementType = styled(
  "li",
  options("Option"),
)(({ theme }) => ({
  alignItems: "center",
  boxSizing: "border-box",
  cursor: "pointer",
  display: "flex",
  justifyContent: "flex-start",
  minHeight: 48,
  outline: 0,
  overflow: "hidden",
  padding: "6px 16px",
  WebkitTapHighlightColor: "transparent",
  [theme.breakpoints.up("sm")]: { minHeight: "auto" },
  "&.Mui-focused": { backgroundColor: theme.palette.action.hover },
  "&.Mui-focusVisible": { backgroundColor: theme.palette.action.focus },
  '&[aria-disabled="true"]': {
    opacity: theme.palette.action.disabledOpacity,
    pointerEvents: "none",
  },
  '&[aria-selected="true"]': { backgroundColor: theme.palette.action.selected },
}));
export const VireoFormAutocompleteMultipleFieldGroup: React.ElementType = styled(
  "li",
  options("Group"),
)({ listStyle: "none" });
export const VireoFormAutocompleteMultipleFieldGroupLabel: React.ElementType = styled(
  ListSubheader,
  options("GroupLabel"),
)(({ theme }) => ({ backgroundColor: theme.palette.background.paper, top: -8 }));
export const VireoFormAutocompleteMultipleFieldGroupList: React.ElementType = styled(
  "ul",
  options("GroupList"),
)({ margin: 0, padding: 0, "& .MuiAutocomplete-option": { paddingLeft: 24 } });
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
