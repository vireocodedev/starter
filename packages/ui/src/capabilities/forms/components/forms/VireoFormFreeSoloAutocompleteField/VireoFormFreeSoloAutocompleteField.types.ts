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
  VireoFormFreeSoloAutocompleteFieldClasses,
  VireoFormFreeSoloAutocompleteFieldClassKey,
} from "./VireoFormFreeSoloAutocompleteField.classes";
import type { VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME } from "./VireoFormFreeSoloAutocompleteField.identity";

export type VireoFormFreeSoloAutocompleteFieldInputChangeReason =
  "input" | "reset" | "clear" | "blur" | "selectOption" | "removeOption";
export type VireoFormFreeSoloAutocompleteFieldSelection<TOption> = {
  value: string;
  label: string;
  custom: boolean;
  option: TOption | null;
};
export type VireoFormFreeSoloAutocompleteFieldValueChangeDetails<TOption> =
  | { reason: "selectOption"; option: TOption; value: string }
  | { reason: "createOption"; value: string }
  | { reason: "clear"; previousValue: string | null };
export type VireoFormFreeSoloAutocompleteFieldRenderOptionState = {
  inputValue: string;
  selected: boolean;
  disabled: boolean;
  index: number;
};
export type VireoFormFreeSoloAutocompleteFieldFilterState = { inputValue: string };

export type VireoFormFreeSoloAutocompleteFieldOwnerState = {
  dirty: boolean;
  disabled: boolean;
  error: boolean;
  focused: boolean;
  hasInputValue: boolean;
  hasValue: boolean;
  loading: boolean;
  open: boolean;
  readOnly: boolean;
  required: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormFreeSoloAutocompleteFieldSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoFormFreeSoloAutocompleteFieldSlots = {
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
  VireoFormFreeSoloAutocompleteFieldSlotPropsOverrides,
  VireoFormFreeSoloAutocompleteFieldOwnerState
>;
export type VireoFormFreeSoloAutocompleteFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormFreeSoloAutocompleteFieldSlots,
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
  | "loading"
  | "loadingText"
  | "multiple"
  | "noOptionsText"
  | "onBlur"
  | "onChange"
  | "onHighlightChange"
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
export type VireoFormFreeSoloAutocompleteFieldInheritedProps<TOption> = Omit<
  AutocompleteProps<TOption, false, false, true>,
  OwnedAutocompleteProp
>;
type FilterContract<TOption> =
  | {
      filterMode?: "client";
      filterOptions?: (
        options: readonly TOption[],
        state: VireoFormFreeSoloAutocompleteFieldFilterState,
      ) => readonly TOption[];
    }
  | { filterMode: "server"; filterOptions?: never };

export type VireoFormFreeSoloAutocompleteFieldOwnProps<TOption> = VireoFormFreeSoloAutocompleteFieldSlotsAndSlotProps &
  FilterContract<TOption> & {
    label: React.ReactNode;
    options: readonly TOption[];
    getOptionValue: (option: TOption) => string;
    getOptionLabel: (option: TOption) => string;
    getOptionDisabled?: (option: TOption) => boolean;
    renderOption?: (option: TOption, state: VireoFormFreeSoloAutocompleteFieldRenderOptionState) => React.ReactNode;
    createOptionLabel?: (value: string) => React.ReactNode;
    normalizeValue?: (value: string) => string;
    isValueEqual?: (left: string, right: string) => boolean;
    commitOnBlur?: boolean;
    groupBy?: (option: TOption) => string;
    renderGroupLabel?: (group: string) => React.ReactNode;
    classes?: Partial<VireoFormFreeSoloAutocompleteFieldClasses>;
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
    onInputValueChange?: (value: string, reason: VireoFormFreeSoloAutocompleteFieldInputChangeReason) => void;
    onValueChange?: (
      value: string | null,
      details: VireoFormFreeSoloAutocompleteFieldValueChangeDetails<TOption>,
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
    onClose?: NonNullable<AutocompleteProps<TOption, false, false, true>["onClose"]>;
    clearIcon?: React.ReactNode;
    popupIcon?: React.ReactNode;
  };
export type VireoFormFreeSoloAutocompleteFieldProps<TOption = string> =
  VireoFormFreeSoloAutocompleteFieldOwnProps<TOption> & VireoFormFreeSoloAutocompleteFieldInheritedProps<TOption>;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME]?: VireoThemeComponent<
      VireoFormFreeSoloAutocompleteFieldProps,
      VireoFormFreeSoloAutocompleteFieldClassKey,
      VireoFormFreeSoloAutocompleteFieldOwnerState,
      Theme
    >;
  }
}
