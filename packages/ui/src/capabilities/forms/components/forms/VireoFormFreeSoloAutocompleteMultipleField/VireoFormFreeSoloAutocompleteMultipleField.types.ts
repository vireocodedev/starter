import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type {
  AutocompleteProps,
  Box,
  Button,
  Checkbox,
  Chip,
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
  VireoFormFreeSoloAutocompleteMultipleFieldClasses,
  VireoFormFreeSoloAutocompleteMultipleFieldClassKey,
} from "./VireoFormFreeSoloAutocompleteMultipleField.classes";
import type { VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME } from "./VireoFormFreeSoloAutocompleteMultipleField.identity";

export type VireoFormFreeSoloAutocompleteMultipleFieldInputChangeReason =
  "input" | "reset" | "clear" | "blur" | "selectOption" | "removeOption";
export type VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption> = {
  value: string;
  label: string;
  custom: boolean;
  option: TOption | null;
};
export type VireoFormFreeSoloAutocompleteMultipleFieldValueChangeDetails<TOption> =
  | { reason: "selectOption"; option: TOption; value: string }
  | { reason: "createOption"; value: string }
  | { reason: "removeOption"; option: TOption | null; value: string }
  | { reason: "clear"; previousValues: string[] };
export type VireoFormFreeSoloAutocompleteMultipleFieldRenderOptionState = {
  inputValue: string;
  selected: boolean;
  disabled: boolean;
  index: number;
};
export type VireoFormFreeSoloAutocompleteMultipleFieldFilterState = { inputValue: string };
export type VireoFormFreeSoloAutocompleteMultipleFieldRenderSelectedOptionsParams<TOption> = {
  selections: readonly VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption>[];
  displayedSelections: readonly VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption>[];
  hiddenCount: number;
  maxDisplayedOptions: number;
  getRemoveButtonProps: (value: string) => {
    "aria-label": string;
    disabled: boolean;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
  };
};
export type VireoFormFreeSoloAutocompleteMultipleFieldOwnerState = {
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
  atSelectionLimit: boolean;
  hasHiddenOptions: boolean;
};
export interface VireoFormFreeSoloAutocompleteMultipleFieldSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoFormFreeSoloAutocompleteMultipleFieldSlots = {
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
  selectedOptions: React.ElementType;
  selectedOption: React.ElementType;
  selectedOptionDeleteIcon: React.ElementType;
  hiddenOptionsButton: React.ElementType;
  optionCheckbox: React.ElementType;
};
type CommonSlotProps<T extends React.ElementType> = SlotProps<
  T,
  VireoFormFreeSoloAutocompleteMultipleFieldSlotPropsOverrides,
  VireoFormFreeSoloAutocompleteMultipleFieldOwnerState
>;
export type VireoFormFreeSoloAutocompleteMultipleFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormFreeSoloAutocompleteMultipleFieldSlots,
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
    selectedOptions: CommonSlotProps<"div">;
    selectedOption: CommonSlotProps<typeof Chip>;
    selectedOptionDeleteIcon: CommonSlotProps<"svg">;
    hiddenOptionsButton: CommonSlotProps<typeof Button>;
    optionCheckbox: CommonSlotProps<typeof Checkbox>;
  }
>;
type OwnedAutocompleteProp =
  | "ChipProps"
  | "clearIcon"
  | "defaultValue"
  | "disabled"
  | "disableClearable"
  | "filterOptions"
  | "freeSolo"
  | "getLimitTagsText"
  | "getOptionDisabled"
  | "getOptionKey"
  | "getOptionLabel"
  | "groupBy"
  | "inputValue"
  | "isOptionEqualToValue"
  | "limitTags"
  | "loading"
  | "loadingText"
  | "multiple"
  | "noOptionsText"
  | "onBlur"
  | "onChange"
  | "onClose"
  | "onHighlightChange"
  | "onInputChange"
  | "onOpen"
  | "open"
  | "options"
  | "readOnly"
  | "renderGroup"
  | "renderInput"
  | "renderOption"
  | "renderTags"
  | "renderValue"
  | "slotProps"
  | "slots"
  | "value";
export type VireoFormFreeSoloAutocompleteMultipleFieldInheritedProps<TOption> = Omit<
  AutocompleteProps<TOption, true, false, true>,
  OwnedAutocompleteProp
>;
type FilterContract<TOption> =
  | {
      filterMode?: "client";
      filterOptions?: (
        options: readonly TOption[],
        state: VireoFormFreeSoloAutocompleteMultipleFieldFilterState,
      ) => readonly TOption[];
    }
  | { filterMode: "server"; filterOptions?: never };
export type VireoFormFreeSoloAutocompleteMultipleFieldOwnProps<TOption> =
  VireoFormFreeSoloAutocompleteMultipleFieldSlotsAndSlotProps &
    FilterContract<TOption> & {
      label: React.ReactNode;
      options: readonly TOption[];
      getOptionValue: (option: TOption) => string;
      getOptionLabel: (option: TOption) => string;
      getOptionDisabled?: (option: TOption) => boolean;
      renderOption?: (
        option: TOption,
        state: VireoFormFreeSoloAutocompleteMultipleFieldRenderOptionState,
      ) => React.ReactNode;
      createOptionLabel?: (value: string) => React.ReactNode;
      normalizeValue?: (value: string) => string;
      isValueEqual?: (left: string, right: string) => boolean;
      commitOnBlur?: boolean;
      groupBy?: (option: TOption) => string;
      renderGroupLabel?: (group: string) => React.ReactNode;
      renderSelectedOptions?: (
        params: VireoFormFreeSoloAutocompleteMultipleFieldRenderSelectedOptionsParams<TOption>,
      ) => React.ReactNode;
      maxDisplayedOptions?: number;
      maxSelectedOptions?: number;
      getHiddenOptionsText?: (count: number) => React.ReactNode;
      getHiddenOptionsLabel?: (count: number) => string;
      getRemoveOptionLabel?: (selection: VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption>) => string;
      hideOptionCheckbox?: boolean;
      removeOnBackspace?: boolean;
      classes?: Partial<VireoFormFreeSoloAutocompleteMultipleFieldClasses>;
      disabled?: boolean;
      readOnly?: boolean;
      readOnlyEmptyValue?: React.ReactNode;
      renderReadOnlyValue?: (
        values: readonly string[],
        selections: readonly VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption>[],
      ) => React.ReactNode;
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
      onInputValueChange?: (value: string, reason: VireoFormFreeSoloAutocompleteMultipleFieldInputChangeReason) => void;
      onValueChange?: (
        value: string[],
        details: VireoFormFreeSoloAutocompleteMultipleFieldValueChangeDetails<TOption>,
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
      onClose?: NonNullable<AutocompleteProps<TOption, true, false, true>["onClose"]>;
      clearIcon?: React.ReactNode;
      popupIcon?: React.ReactNode;
    };
export type VireoFormFreeSoloAutocompleteMultipleFieldProps<TOption = string> =
  VireoFormFreeSoloAutocompleteMultipleFieldOwnProps<TOption> &
    VireoFormFreeSoloAutocompleteMultipleFieldInheritedProps<TOption>;
declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME]?: VireoThemeComponent<
      VireoFormFreeSoloAutocompleteMultipleFieldProps,
      VireoFormFreeSoloAutocompleteMultipleFieldClassKey,
      VireoFormFreeSoloAutocompleteMultipleFieldOwnerState,
      Theme
    >;
  }
}
