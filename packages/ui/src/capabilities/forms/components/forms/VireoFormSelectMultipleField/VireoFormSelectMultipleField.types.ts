import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type {
  Checkbox,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectProps,
  TextFieldProps,
  Typography,
} from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoFormSelectMultipleFieldClasses,
  type VireoFormSelectMultipleFieldClassKey,
} from "./VireoFormSelectMultipleField.classes";
import type { VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME } from "./VireoFormSelectMultipleField.identity";

/** Scalar option identifiers stored in arrays by `field.SelectMultipleField`. */
export type VireoFormSelectMultipleFieldValue = string | number;

export type VireoFormSelectMultipleFieldOwnerState = {
  dirty: boolean;
  disabled: boolean;
  errorVisible: boolean;
  hasValue: boolean;
  invalid: boolean;
  readOnly: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export type VireoFormSelectMultipleFieldRenderSelectedOptionsParams<TOption> = {
  /** Every recognized selected option, in the bound value array's order. */
  selectedOptions: readonly TOption[];
  /** The leading options included by `maxDisplayedOptions`. */
  displayedOptions: readonly TOption[];
  /** Number of recognized selected options omitted from `displayedOptions`. */
  hiddenCount: number;
  /** Resolved non-negative compact-summary limit. */
  maxDisplayedOptions: number;
};

export interface VireoFormSelectMultipleFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldInputLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldHtmlInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldSelectSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldSelectionSummarySlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldOptionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldOptionCheckboxSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldOptionTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldClearButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectMultipleFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by the bound form multiple-select field. */
export type VireoFormSelectMultipleFieldSlots = {
  root: React.ElementType;
  inputLabel: React.ElementType;
  input: React.ElementType;
  htmlInput: React.ElementType;
  select: React.ElementType;
  selectionSummary: React.ElementType;
  option: React.ElementType;
  optionCheckbox: React.ElementType;
  optionText: React.ElementType;
  clearButton: React.ElementType;
  formHelperText: React.ElementType;
};

/** Slot props exposed by the bound form multiple-select field. */
export type VireoFormSelectMultipleFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormSelectMultipleFieldSlots,
  {
    /** @default FormControl */
    root: SlotProps<
      typeof FormControl,
      VireoFormSelectMultipleFieldRootSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default InputLabel */
    inputLabel: SlotProps<
      typeof InputLabel,
      VireoFormSelectMultipleFieldInputLabelSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default OutlinedInput; follows `variant` for standard and filled fields. */
    input: SlotProps<
      typeof OutlinedInput,
      VireoFormSelectMultipleFieldInputSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default 'input' */
    htmlInput: SlotProps<
      "input",
      VireoFormSelectMultipleFieldHtmlInputSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default Select */
    select: SlotProps<
      typeof Select,
      VireoFormSelectMultipleFieldSelectSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default Typography */
    selectionSummary: SlotProps<
      typeof Typography,
      VireoFormSelectMultipleFieldSelectionSummarySlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default MenuItem */
    option: SlotProps<
      typeof MenuItem,
      VireoFormSelectMultipleFieldOptionSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default Checkbox */
    optionCheckbox: SlotProps<
      typeof Checkbox,
      VireoFormSelectMultipleFieldOptionCheckboxSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default ListItemText */
    optionText: SlotProps<
      typeof ListItemText,
      VireoFormSelectMultipleFieldOptionTextSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default IconButton */
    clearButton: SlotProps<
      typeof IconButton,
      VireoFormSelectMultipleFieldClearButtonSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormSelectMultipleFieldFormHelperTextSlotPropsOverrides,
      VireoFormSelectMultipleFieldOwnerState
    >;
  }
>;

type VireoFormSelectMultipleFieldComponentOwnedProp =
  | "FormHelperTextProps"
  | "InputLabelProps"
  | "InputProps"
  | "SelectProps"
  | "children"
  | "classes"
  | "defaultValue"
  | "disabled"
  | "error"
  | "fullWidth"
  | "helperText"
  | "inputProps"
  | "inputRef"
  | "maxRows"
  | "minRows"
  | "multiline"
  | "name"
  | "onBlur"
  | "onChange"
  | "required"
  | "rows"
  | "select"
  | "slotProps"
  | "slots"
  | "type"
  | "value";

/** Props inherited from MUI TextField after excluding form-owned and Vireo-owned props. */
export type VireoFormSelectMultipleFieldInheritedProps = Omit<
  TextFieldProps,
  VireoFormSelectMultipleFieldComponentOwnedProp
>;

/** Props owned by the bound form multiple-select field. The field name and array value remain owned by `form.Field`. */
export type VireoFormSelectMultipleFieldOwnProps<
  TOption,
  TValue extends VireoFormSelectMultipleFieldValue,
> = VireoFormSelectMultipleFieldSlotsAndSlotProps & {
  /** Accessible label used by the visible select control. */
  label: React.ReactNode;
  /** Options rendered by the field. */
  options: readonly TOption[];
  /** Returns the stable non-empty scalar value stored for one option. */
  getOptionValue: (option: TOption) => TValue;
  /** Renders one dropdown option and the default selected-value summary item. */
  renderOption: (option: TOption) => React.ReactNode;
  /** Replaces the complete selected-value presentation. */
  renderSelectedOptions?: (params: VireoFormSelectMultipleFieldRenderSelectedOptionsParams<TOption>) => React.ReactNode;
  /** Maximum option labels shown by the compact default summary. @default 2 */
  maxDisplayedOptions?: number;
  /** Returns whether one option is unavailable. */
  getOptionDisabled?: (option: TOption) => boolean;
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoFormSelectMultipleFieldClasses>;
  disabled?: boolean;
  /** Adds an error presentation state without suppressing validation errors. */
  error?: boolean;
  /** Overrides the enclosing form's error-display policy for this field. */
  errorDisplay?: VireoFormErrorDisplay;
  /** Overrides the enclosing form's validation-error formatter for this field. */
  formatError?: VireoFormErrorFormatter;
  /** @default true */
  fullWidth?: boolean;
  /** Shown when no visible form validation error takes precedence. */
  helperText?: React.ReactNode;
  /** Text rendered when the bound value is empty. */
  placeholder?: React.ReactNode;
  /** Prevents all selected values from being cleared at once. @default false */
  disableClearable?: boolean;
  /** Accessible label for the clear-all action. @default 'Clear selections' */
  clearLabel?: string;
  /** Replaces the default clear icon without replacing the button slot. */
  clearIcon?: React.ReactNode;
  /** Ref forwarded to MUI's select input. */
  inputRef?: SelectProps<TValue[]>["inputRef"];
  onBlur?: NonNullable<SelectProps<TValue[]>["onBlur"]>;
  /** Observes accepted selection and clear-all changes after cancelable slot handlers. */
  onValueChange?: (value: TValue[]) => void;
  readOnly?: boolean;
  required?: boolean;
};

/** Props accepted by `field.SelectMultipleField`. */
export type VireoFormSelectMultipleFieldProps<
  TOption = unknown,
  TValue extends VireoFormSelectMultipleFieldValue = VireoFormSelectMultipleFieldValue,
> = VireoFormSelectMultipleFieldOwnProps<TOption, TValue> & VireoFormSelectMultipleFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME]?: VireoThemeComponent<
      VireoFormSelectMultipleFieldProps,
      VireoFormSelectMultipleFieldClassKey,
      VireoFormSelectMultipleFieldOwnerState,
      Theme
    >;
  }
}
