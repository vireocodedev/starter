import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type {
  AutocompleteProps,
  Box,
  CircularProgress,
  FormHelperText,
  IconButton,
  InputLabel,
  ListSubheader,
  Paper,
  Popper,
  TextField,
  TextFieldProps,
} from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type {
  VireoFormAutocompleteFieldClasses,
  VireoFormAutocompleteFieldClassKey,
} from "./VireoFormAutocompleteField.classes";
import type { VIREO_FORM_AUTOCOMPLETE_FIELD_NAME } from "./VireoFormAutocompleteField.identity";

export type VireoFormAutocompleteFieldValue = string | number;
export type VireoFormAutocompleteFieldInputChangeReason =
  "input" | "reset" | "clear" | "blur" | "selectOption" | "removeOption";
export type VireoFormAutocompleteFieldSelection<TOption, TValue extends VireoFormAutocompleteFieldValue> = {
  value: TValue;
  label: string;
  resolved: boolean;
  option: TOption | null;
};
export type VireoFormAutocompleteFieldValueChangeDetails<TOption, TValue extends VireoFormAutocompleteFieldValue> =
  { reason: "selectOption"; option: TOption; value: TValue } | { reason: "clear"; previousValue: TValue | null };
export type VireoFormAutocompleteFieldRenderOptionState = {
  inputValue: string;
  selected: boolean;
  disabled: boolean;
  index: number;
};
export type VireoFormAutocompleteFieldFilterState = { inputValue: string };

export type VireoFormAutocompleteFieldOwnerState = {
  dirty: boolean;
  disabled: boolean;
  error: boolean;
  focused: boolean;
  hasInputValue: boolean;
  hasUnresolvedValue: boolean;
  hasValue: boolean;
  loading: boolean;
  open: boolean;
  readOnly: boolean;
  required: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormAutocompleteFieldSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoFormAutocompleteFieldSlots = {
  root: React.ElementType;
  textField: React.ElementType;
  inputLabel: React.ElementType;
  input: React.ElementType;
  htmlInput: React.ElementType;
  loadingIndicator: React.ElementType;
  clearButton: React.ElementType;
  clearIcon: React.ElementType;
  popupButton: React.ElementType;
  popupIcon: React.ElementType;
  formHelperText: React.ElementType;
  popper: React.ElementType;
  paper: React.ElementType;
  loadingText: React.ElementType;
  noOptionsText: React.ElementType;
  listbox: React.ElementType;
  option: React.ElementType;
  group: React.ElementType;
  groupLabel: React.ElementType;
  groupList: React.ElementType;
};
type CommonSlotProps<T extends React.ElementType> = SlotProps<
  T,
  VireoFormAutocompleteFieldSlotPropsOverrides,
  VireoFormAutocompleteFieldOwnerState
>;
export type VireoFormAutocompleteFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormAutocompleteFieldSlots,
  {
    root: CommonSlotProps<typeof Box>;
    textField: CommonSlotProps<typeof TextField>;
    inputLabel: CommonSlotProps<typeof InputLabel>;
    input: CommonSlotProps<"div">;
    htmlInput: CommonSlotProps<"input">;
    loadingIndicator: CommonSlotProps<typeof CircularProgress>;
    clearButton: CommonSlotProps<typeof IconButton>;
    clearIcon: CommonSlotProps<"svg">;
    popupButton: CommonSlotProps<typeof IconButton>;
    popupIcon: CommonSlotProps<"svg">;
    formHelperText: CommonSlotProps<typeof FormHelperText>;
    popper: CommonSlotProps<typeof Popper>;
    paper: CommonSlotProps<typeof Paper>;
    loadingText: CommonSlotProps<"div">;
    noOptionsText: CommonSlotProps<"div">;
    listbox: CommonSlotProps<"ul">;
    option: CommonSlotProps<"li">;
    group: CommonSlotProps<"li">;
    groupLabel: CommonSlotProps<typeof ListSubheader>;
    groupList: CommonSlotProps<"ul">;
  }
>;

type OwnedAutocompleteProp =
  | "clearIcon"
  | "defaultValue"
  | "disabled"
  | "disableClearable"
  | "filterOptions"
  | "freeSolo"
  | "getOptionDisabled"
  | "getOptionKey"
  | "getOptionLabel"
  | "groupBy"
  | "inputValue"
  | "isOptionEqualToValue"
  | "onHighlightChange"
  | "loading"
  | "loadingText"
  | "multiple"
  | "noOptionsText"
  | "onBlur"
  | "onChange"
  | "onInputChange"
  | "options"
  | "onClose"
  | "onOpen"
  | "open"
  | "readOnly"
  | "renderGroup"
  | "renderInput"
  | "renderOption"
  | "renderTags"
  | "renderValue"
  | "slotProps"
  | "slots"
  | "value";
export type VireoFormAutocompleteFieldInheritedProps<TOption> = Omit<
  AutocompleteProps<TOption, false, false, false>,
  OwnedAutocompleteProp
>;
type FilterContract<TOption> =
  | {
      filterMode?: "client";
      filterOptions?: (options: readonly TOption[], state: VireoFormAutocompleteFieldFilterState) => readonly TOption[];
    }
  | { filterMode: "server"; filterOptions?: never };

export type VireoFormAutocompleteFieldOwnProps<
  TOption,
  TValue extends VireoFormAutocompleteFieldValue,
> = VireoFormAutocompleteFieldSlotsAndSlotProps &
  FilterContract<TOption> & {
    label: React.ReactNode;
    options: readonly TOption[];
    getOptionValue: (option: TOption) => TValue;
    getOptionLabel: (option: TOption) => string;
    getOptionDisabled?: (option: TOption) => boolean;
    renderOption?: (option: TOption, state: VireoFormAutocompleteFieldRenderOptionState) => React.ReactNode;
    selectedOption?: TOption;
    getUnresolvedValueLabel?: (value: TValue) => string;
    groupBy?: (option: TOption) => string;
    renderGroupLabel?: (group: string) => React.ReactNode;
    classes?: Partial<VireoFormAutocompleteFieldClasses>;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    error?: boolean;
    errorDisplay?: VireoFormErrorDisplay;
    formatError?: VireoFormErrorFormatter;
    /** Defaults to a reserved line; pass `null` to remove it. @default ' ' */
    helperText?: React.ReactNode;
    fullWidth?: boolean;
    placeholder?: string;
    variant?: TextFieldProps["variant"];
    size?: TextFieldProps["size"];
    color?: TextFieldProps["color"];
    margin?: TextFieldProps["margin"];
    inputRef?: React.Ref<HTMLInputElement>;
    inputValue?: string;
    defaultInputValue?: string;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onInputValueChange?: (value: string, reason: VireoFormAutocompleteFieldInputChangeReason) => void;
    onValueChange?: (
      value: TValue | null,
      details: VireoFormAutocompleteFieldValueChangeDetails<TOption, TValue>,
    ) => void;
    loading?: boolean;
    loadingText?: React.ReactNode;
    noOptionsText?: React.ReactNode;
    disableClearable?: boolean;
    clearOnEscape?: boolean;
    clearLabel?: string;
    openLabel?: string;
    closeLabel?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpen?: () => void;
    onClose?: NonNullable<AutocompleteProps<TOption, false, false, false>["onClose"]>;
    clearIcon?: React.ReactNode;
    popupIcon?: React.ReactNode;
  };
export type VireoFormAutocompleteFieldProps<
  TOption = unknown,
  TValue extends VireoFormAutocompleteFieldValue = VireoFormAutocompleteFieldValue,
> = VireoFormAutocompleteFieldOwnProps<TOption, TValue> & VireoFormAutocompleteFieldInheritedProps<TOption>;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_AUTOCOMPLETE_FIELD_NAME]?: VireoThemeComponent<
      VireoFormAutocompleteFieldProps,
      VireoFormAutocompleteFieldClassKey,
      VireoFormAutocompleteFieldOwnerState,
      Theme
    >;
  }
}
