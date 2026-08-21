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
import { VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME } from "./VireoFormFreeSoloAutocompleteField.identity";
import type { VireoFormFreeSoloAutocompleteFieldOwnerState } from "./VireoFormFreeSoloAutocompleteField.types";

type StyledProps = StyledSlotProps<VireoFormFreeSoloAutocompleteFieldOwnerState>;
type StyledComponent<TProps extends object> = StyledSlotComponent<TProps, VireoFormFreeSoloAutocompleteFieldOwnerState>;
const options = (slot: string) => ({
  name: VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME,
  slot,
  overridesResolver: (_props: unknown, styles: Record<string, unknown>) =>
    styles[slot.charAt(0).toLowerCase() + slot.slice(1)] as never,
});

export const VireoFormFreeSoloAutocompleteFieldRoot: StyledComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME,
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
  ],
})<StyledProps>({ minWidth: 0 });

export const VireoFormFreeSoloAutocompleteFieldTextField: React.ElementType = styled(
  TextField,
  options("TextField"),
)({});
export const VireoFormFreeSoloAutocompleteFieldInputLabel: React.ElementType = styled(
  InputLabel,
  options("InputLabel"),
)({});
export const VireoFormFreeSoloAutocompleteFieldOutlinedInput: React.ElementType = styled(
  OutlinedInput,
  options("Input"),
)({});
export const VireoFormFreeSoloAutocompleteFieldFilledInput: React.ElementType = styled(
  FilledInput,
  options("Input"),
)({});
export const VireoFormFreeSoloAutocompleteFieldStandardInput: React.ElementType = styled(Input, options("Input"))({});
export const VireoFormFreeSoloAutocompleteFieldLoadingIndicator: React.ElementType = styled(
  CircularProgress,
  options("LoadingIndicator"),
)({});
export const VireoFormFreeSoloAutocompleteFieldClearButton: React.ElementType = styled(
  IconButton,
  options("ClearButton"),
)({});
export const VireoFormFreeSoloAutocompleteFieldClearIcon: React.ElementType = styled(Close, options("ClearIcon"))({});
export const VireoFormFreeSoloAutocompleteFieldPopupButton: React.ElementType = styled(
  IconButton,
  options("PopupButton"),
)({});
export const VireoFormFreeSoloAutocompleteFieldPopupIcon: React.ElementType = styled(
  ArrowDropDown,
  options("PopupIcon"),
)({});
export const VireoFormFreeSoloAutocompleteFieldFormHelperText: React.ElementType = styled(
  FormHelperText,
  options("FormHelperText"),
)({});
const VireoFormFreeSoloAutocompleteFieldStyledPopper = styled(
  Popper,
  options("Popper"),
)(({ theme }) => ({ zIndex: theme.zIndex.modal }));
const VireoFormFreeSoloAutocompleteFieldStyledPaper = styled(
  Paper,
  options("Paper"),
)(({ theme }) => ({ ...theme.typography.body1, overflow: "auto" }));
type PopperSlotProps = PopperProps & StyledProps;
type PaperSlotProps = PaperProps & StyledProps;
export const VireoFormFreeSoloAutocompleteFieldPopper = React.forwardRef<HTMLDivElement, PopperSlotProps>(
  function VireoFormFreeSoloAutocompleteFieldPopper(props, ref) {
    return React.createElement(VireoFormFreeSoloAutocompleteFieldStyledPopper, { ...props, ref });
  },
);
export const VireoFormFreeSoloAutocompleteFieldPaper = React.forwardRef<HTMLDivElement, PaperSlotProps>(
  function VireoFormFreeSoloAutocompleteFieldPaper(props, ref) {
    return React.createElement(VireoFormFreeSoloAutocompleteFieldStyledPaper, { ...props, ref });
  },
);
export const VireoFormFreeSoloAutocompleteFieldLoadingText: React.ElementType = styled(
  "div",
  options("LoadingText"),
)({});
export const VireoFormFreeSoloAutocompleteFieldNoOptionsText: React.ElementType = styled(
  "div",
  options("NoOptionsText"),
)({});
const VireoFormFreeSoloAutocompleteFieldStyledListbox = styled(
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
export const VireoFormFreeSoloAutocompleteFieldListbox = React.forwardRef<HTMLUListElement, ListboxSlotProps>(
  function VireoFormFreeSoloAutocompleteFieldListbox(props, ref) {
    return React.createElement(VireoFormFreeSoloAutocompleteFieldStyledListbox, { ...props, ref });
  },
);
export const VireoFormFreeSoloAutocompleteFieldOption: React.ElementType = styled(
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
export const VireoFormFreeSoloAutocompleteFieldGroup: React.ElementType = styled(
  "li",
  options("Group"),
)({ listStyle: "none" });
export const VireoFormFreeSoloAutocompleteFieldGroupLabel: React.ElementType = styled(
  ListSubheader,
  options("GroupLabel"),
)(({ theme }) => ({ backgroundColor: theme.palette.background.paper, top: -8 }));
export const VireoFormFreeSoloAutocompleteFieldGroupList: React.ElementType = styled(
  "ul",
  options("GroupList"),
)({ margin: 0, padding: 0, "& .MuiAutocomplete-option": { paddingLeft: 24 } });
