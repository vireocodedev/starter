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
  type PaperProps,
  type PopperProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
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
const VireoFormAutocompleteFieldStyledPopper = styled(
  Popper,
  options("Popper"),
)(({ theme }) => ({ zIndex: theme.zIndex.modal }));
const VireoFormAutocompleteFieldStyledPaper = styled(
  Paper,
  options("Paper"),
)(({ theme }) => ({ ...theme.typography.body1, overflow: "auto" }));
type PopperSlotProps = PopperProps & StyledProps;
type PaperSlotProps = PaperProps & StyledProps;
export const VireoFormAutocompleteFieldPopper = React.forwardRef<HTMLDivElement, PopperSlotProps>(
  function VireoFormAutocompleteFieldPopper(props, ref) {
    return React.createElement(VireoFormAutocompleteFieldStyledPopper, { ...props, ref });
  },
);
export const VireoFormAutocompleteFieldPaper = React.forwardRef<HTMLDivElement, PaperSlotProps>(
  function VireoFormAutocompleteFieldPaper(props, ref) {
    return React.createElement(VireoFormAutocompleteFieldStyledPaper, { ...props, ref });
  },
);
export const VireoFormAutocompleteFieldLoadingText: React.ElementType = styled("div", options("LoadingText"))({});
export const VireoFormAutocompleteFieldNoOptionsText: React.ElementType = styled("div", options("NoOptionsText"))({});
const VireoFormAutocompleteFieldStyledListbox = styled(
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
export const VireoFormAutocompleteFieldListbox = React.forwardRef<HTMLUListElement, ListboxSlotProps>(
  function VireoFormAutocompleteFieldListbox(props, ref) {
    return React.createElement(VireoFormAutocompleteFieldStyledListbox, { ...props, ref });
  },
);
export const VireoFormAutocompleteFieldOption: React.ElementType = styled(
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
export const VireoFormAutocompleteFieldGroup: React.ElementType = styled("li", options("Group"))({ listStyle: "none" });
export const VireoFormAutocompleteFieldGroupLabel: React.ElementType = styled(
  ListSubheader,
  options("GroupLabel"),
)(({ theme }) => ({ backgroundColor: theme.palette.background.paper, top: -8 }));
export const VireoFormAutocompleteFieldGroupList: React.ElementType = styled(
  "ul",
  options("GroupList"),
)({ margin: 0, padding: 0, "& .MuiAutocomplete-option": { paddingLeft: 24 } });
