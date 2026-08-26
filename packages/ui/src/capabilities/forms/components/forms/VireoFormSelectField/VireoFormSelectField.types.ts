import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type {
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
} from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormSelectFieldClasses, type VireoFormSelectFieldClassKey } from "./VireoFormSelectField.classes";
import type { VIREO_FORM_SELECT_FIELD_NAME } from "./VireoFormSelectField.identity";

/** Scalar values supported by `field.SelectField`. Objects remain represented by their stable option value. */
export type VireoFormSelectFieldValue = string | number;

export type VireoFormSelectFieldOwnerState = {
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

export interface VireoFormSelectFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectFieldInputLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectFieldInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectFieldHtmlInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectFieldSelectSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectFieldOptionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectFieldOptionTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectFieldClearButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSelectFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by the bound form select field. */
export type VireoFormSelectFieldSlots = {
  root: React.ElementType;
  inputLabel: React.ElementType;
  input: React.ElementType;
  htmlInput: React.ElementType;
  select: React.ElementType;
  option: React.ElementType;
  optionText: React.ElementType;
  clearButton: React.ElementType;
  formHelperText: React.ElementType;
};

/** Slot props exposed by the bound form select field. */
export type VireoFormSelectFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormSelectFieldSlots,
  {
    /** @default FormControl */
    root: SlotProps<typeof FormControl, VireoFormSelectFieldRootSlotPropsOverrides, VireoFormSelectFieldOwnerState>;
    /** @default InputLabel */
    inputLabel: SlotProps<
      typeof InputLabel,
      VireoFormSelectFieldInputLabelSlotPropsOverrides,
      VireoFormSelectFieldOwnerState
    >;
    /** @default OutlinedInput; follows `variant` for standard and filled fields. */
    input: SlotProps<typeof OutlinedInput, VireoFormSelectFieldInputSlotPropsOverrides, VireoFormSelectFieldOwnerState>;
    /** @default 'input' */
    htmlInput: SlotProps<"input", VireoFormSelectFieldHtmlInputSlotPropsOverrides, VireoFormSelectFieldOwnerState>;
    /** @default Select */
    select: SlotProps<typeof Select, VireoFormSelectFieldSelectSlotPropsOverrides, VireoFormSelectFieldOwnerState>;
    /** @default MenuItem */
    option: SlotProps<typeof MenuItem, VireoFormSelectFieldOptionSlotPropsOverrides, VireoFormSelectFieldOwnerState>;
    /** @default ListItemText */
    optionText: SlotProps<
      typeof ListItemText,
      VireoFormSelectFieldOptionTextSlotPropsOverrides,
      VireoFormSelectFieldOwnerState
    >;
    /** @default IconButton */
    clearButton: SlotProps<
      typeof IconButton,
      VireoFormSelectFieldClearButtonSlotPropsOverrides,
      VireoFormSelectFieldOwnerState
    >;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormSelectFieldFormHelperTextSlotPropsOverrides,
      VireoFormSelectFieldOwnerState
    >;
  }
>;

type VireoFormSelectFieldComponentOwnedProp =
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
export type VireoFormSelectFieldInheritedProps = Omit<TextFieldProps, VireoFormSelectFieldComponentOwnedProp>;

/** Props owned by the bound form select field. The field name and value remain owned by `form.Field`. */
export type VireoFormSelectFieldOwnProps<
  TOption,
  TValue extends VireoFormSelectFieldValue,
> = VireoFormSelectFieldSlotsAndSlotProps & {
  /** Accessible label used by the visible select control. */
  label: React.ReactNode;
  /** Options rendered by the field. */
  options: readonly TOption[];
  /** Returns the stable non-empty scalar value stored by the form for one option. */
  getOptionValue: (option: TOption) => TValue;
  /** Renders one option and the selected-value presentation. */
  renderOption: (option: TOption) => React.ReactNode;
  /** Returns whether one option is unavailable. */
  getOptionDisabled?: (option: TOption) => boolean;
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoFormSelectFieldClasses>;
  disabled?: boolean;
  /** Adds an error presentation state without suppressing validation errors. */
  error?: boolean;
  /** Overrides the enclosing form's error-display policy for this field. */
  errorDisplay?: VireoFormErrorDisplay;
  /** Overrides the enclosing form's validation-error formatter for this field. */
  formatError?: VireoFormErrorFormatter;
  /** @default true */
  fullWidth?: boolean;
  /** Shown when no visible validation error takes precedence. Defaults to a reserved line; pass `null` to remove it. @default ' ' */
  helperText?: React.ReactNode;
  /** Text rendered when the bound value is `null`. */
  placeholder?: React.ReactNode;
  /** Prevents the selected value from being cleared. @default false */
  disableClearable?: boolean;
  /** Accessible label for the clear action. @default 'Clear selection' */
  clearLabel?: string;
  /** Replaces the default clear icon without replacing the button slot. */
  clearIcon?: React.ReactNode;
  /** Ref forwarded to MUI's select input. */
  inputRef?: SelectProps<TValue>["inputRef"];
  onBlur?: NonNullable<SelectProps<TValue>["onBlur"]>;
  /** Observes accepted option and clear changes after cancelable slot handlers. */
  onValueChange?: (value: TValue | null) => void;
  readOnly?: boolean;
  required?: boolean;
};

/** Props accepted by `field.SelectField`. */
export type VireoFormSelectFieldProps<
  TOption = unknown,
  TValue extends VireoFormSelectFieldValue = VireoFormSelectFieldValue,
> = VireoFormSelectFieldOwnProps<TOption, TValue> & VireoFormSelectFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_SELECT_FIELD_NAME]?: VireoThemeComponent<
      VireoFormSelectFieldProps,
      VireoFormSelectFieldClassKey,
      VireoFormSelectFieldOwnerState,
      Theme
    >;
  }
}
