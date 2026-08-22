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
import { VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME } from "./VireoFormFreeSoloAutocompleteMultipleField.identity";
import type { VireoFormFreeSoloAutocompleteMultipleFieldOwnerState } from "./VireoFormFreeSoloAutocompleteMultipleField.types";
type StyledProps = StyledSlotProps<VireoFormFreeSoloAutocompleteMultipleFieldOwnerState>;
type StyledComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormFreeSoloAutocompleteMultipleFieldOwnerState
>;
const options = (slot: string) => ({
  name: VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME,
  slot,
  overridesResolver: (_props: unknown, styles: Record<string, unknown>) =>
    styles[slot.charAt(0).toLowerCase() + slot.slice(1)] as never,
});
export const VireoFormFreeSoloAutocompleteMultipleFieldRoot: StyledComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME,
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
    ownerState.atSelectionLimit && styles.atSelectionLimit,
    ownerState.hasHiddenOptions && styles.hasHiddenOptions,
  ],
})<StyledProps>({ minWidth: 0 });
export const VireoFormFreeSoloAutocompleteMultipleFieldTextField: React.ElementType = styled(
  TextField,
  options("TextField"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldInputLabel: React.ElementType = styled(
  InputLabel,
  options("InputLabel"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldOutlinedInput: React.ElementType = styled(
  OutlinedInput,
  options("Input"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldFilledInput: React.ElementType = styled(
  FilledInput,
  options("Input"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldStandardInput: React.ElementType = styled(
  Input,
  options("Input"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldLoadingIndicator: React.ElementType = styled(
  CircularProgress,
  options("LoadingIndicator"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldClearButton: React.ElementType = styled(
  IconButton,
  options("ClearButton"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldClearIcon: React.ElementType = styled(
  Close,
  options("ClearIcon"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldPopupButton: React.ElementType = styled(
  IconButton,
  options("PopupButton"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldPopupIcon: React.ElementType = styled(
  ArrowDropDown,
  options("PopupIcon"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldFormHelperText: React.ElementType = styled(
  FormHelperText,
  options("FormHelperText"),
)({});
const VireoFormFreeSoloAutocompleteMultipleFieldStyledPopper = styled(
  Popper,
  options("Popper"),
)(({ theme }) => ({ zIndex: theme.zIndex.modal }));
const VireoFormFreeSoloAutocompleteMultipleFieldStyledPaper = styled(
  Paper,
  options("Paper"),
)(({ theme }) => ({ ...theme.typography.body1, overflow: "auto" }));
type PopperSlotProps = PopperProps & StyledProps;
type PaperSlotProps = PaperProps & StyledProps;
export const VireoFormFreeSoloAutocompleteMultipleFieldPopper = React.forwardRef<HTMLDivElement, PopperSlotProps>(
  function VireoFormFreeSoloAutocompleteMultipleFieldPopper(props, ref) {
    return React.createElement(VireoFormFreeSoloAutocompleteMultipleFieldStyledPopper, { ...props, ref });
  },
);
export const VireoFormFreeSoloAutocompleteMultipleFieldPaper = React.forwardRef<HTMLDivElement, PaperSlotProps>(
  function VireoFormFreeSoloAutocompleteMultipleFieldPaper(props, ref) {
    return React.createElement(VireoFormFreeSoloAutocompleteMultipleFieldStyledPaper, { ...props, ref });
  },
);
export const VireoFormFreeSoloAutocompleteMultipleFieldLoadingText: React.ElementType = styled(
  "div",
  options("LoadingText"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldNoOptionsText: React.ElementType = styled(
  "div",
  options("NoOptionsText"),
)({});
const VireoFormFreeSoloAutocompleteMultipleFieldStyledListbox = styled(
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
export const VireoFormFreeSoloAutocompleteMultipleFieldListbox = React.forwardRef<HTMLUListElement, ListboxSlotProps>(
  function VireoFormFreeSoloAutocompleteMultipleFieldListbox(props, ref) {
    return React.createElement(VireoFormFreeSoloAutocompleteMultipleFieldStyledListbox, { ...props, ref });
  },
);
export const VireoFormFreeSoloAutocompleteMultipleFieldOption: React.ElementType = styled(
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
export const VireoFormFreeSoloAutocompleteMultipleFieldGroup: React.ElementType = styled(
  "li",
  options("Group"),
)({ listStyle: "none" });
export const VireoFormFreeSoloAutocompleteMultipleFieldGroupLabel: React.ElementType = styled(
  ListSubheader,
  options("GroupLabel"),
)(({ theme }) => ({ backgroundColor: theme.palette.background.paper, top: -8 }));
export const VireoFormFreeSoloAutocompleteMultipleFieldGroupList: React.ElementType = styled(
  "ul",
  options("GroupList"),
)({ margin: 0, padding: 0, "& .MuiAutocomplete-option": { paddingLeft: 24 } });
export const VireoFormFreeSoloAutocompleteMultipleFieldSelectedOptions: React.ElementType = styled(
  "div",
  options("SelectedOptions"),
)({ display: "flex", minWidth: 0, overflow: "hidden", gap: 4, flexWrap: "nowrap" });
export const VireoFormFreeSoloAutocompleteMultipleFieldSelectedOption: React.ElementType = styled(
  Chip,
  options("SelectedOption"),
)({ minWidth: 0, maxWidth: 180, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } });
export const VireoFormFreeSoloAutocompleteMultipleFieldSelectedOptionDeleteIcon: React.ElementType = styled(
  Cancel,
  options("SelectedOptionDeleteIcon"),
)({});
export const VireoFormFreeSoloAutocompleteMultipleFieldHiddenOptionsButton: React.ElementType = styled(
  Button,
  options("HiddenOptionsButton"),
)({ minWidth: 0, flexShrink: 0 });
export const VireoFormFreeSoloAutocompleteMultipleFieldOptionCheckbox: React.ElementType = styled(
  Checkbox,
  options("OptionCheckbox"),
)({ marginRight: 8 });
