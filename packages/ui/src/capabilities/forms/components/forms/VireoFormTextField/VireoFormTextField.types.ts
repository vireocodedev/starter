import type { FormControl, FormHelperText, InputLabel, OutlinedInput, Select, TextFieldProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import { type VireoFormTextFieldClasses, type VireoFormTextFieldClassKey } from "./VireoFormTextField.classes";
import type { VIREO_FORM_TEXT_FIELD_NAME } from "./VireoFormTextField.identity";

export type VireoFormTextFieldOwnerState = {
  dirty: boolean;
  disabled: boolean;
  errorVisible: boolean;
  invalid: boolean;
  readOnly: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormTextFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormTextFieldInputLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormTextFieldInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormTextFieldHtmlInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormTextFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormTextFieldSelectSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by the bound form text field. */
export type VireoFormTextFieldSlots = {
  root: React.ElementType;
  inputLabel: React.ElementType;
  input: React.ElementType;
  htmlInput: React.ElementType;
  formHelperText: React.ElementType;
  select: React.ElementType;
};

/** Slot props exposed by the bound form text field. */
export type VireoFormTextFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormTextFieldSlots,
  {
    /** @default FormControl */
    root: SlotProps<typeof FormControl, VireoFormTextFieldRootSlotPropsOverrides, VireoFormTextFieldOwnerState>;
    /** @default InputLabel */
    inputLabel: SlotProps<
      typeof InputLabel,
      VireoFormTextFieldInputLabelSlotPropsOverrides,
      VireoFormTextFieldOwnerState
    >;
    /** @default OutlinedInput; follows `variant` for standard and filled fields. */
    input: SlotProps<typeof OutlinedInput, VireoFormTextFieldInputSlotPropsOverrides, VireoFormTextFieldOwnerState>;
    /** @default 'input' */
    htmlInput: SlotProps<"input", VireoFormTextFieldHtmlInputSlotPropsOverrides, VireoFormTextFieldOwnerState>;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormTextFieldFormHelperTextSlotPropsOverrides,
      VireoFormTextFieldOwnerState
    >;
    /** @default Select */
    select: SlotProps<typeof Select, VireoFormTextFieldSelectSlotPropsOverrides, VireoFormTextFieldOwnerState>;
  }
>;

type VireoFormTextFieldComponentOwnedProp =
  | "FormHelperTextProps"
  | "InputLabelProps"
  | "InputProps"
  | "SelectProps"
  | "classes"
  | "defaultValue"
  | "disabled"
  | "error"
  | "fullWidth"
  | "helperText"
  | "inputProps"
  | "inputRef"
  | "name"
  | "onBlur"
  | "onChange"
  | "required"
  | "slotProps"
  | "slots"
  | "value";

/** Props inherited from MUI TextField after excluding form-owned and Vireo-owned props. */
export type VireoFormTextFieldInheritedProps = Omit<TextFieldProps, VireoFormTextFieldComponentOwnedProp>;

/** Props owned by the bound form text field. The field name and value remain owned by `form.Field`. */
export type VireoFormTextFieldOwnProps = VireoFormTextFieldSlotsAndSlotProps & {
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoFormTextFieldClasses>;
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
  /** Ref forwarded to the native input or textarea. */
  inputRef?: React.Ref<HTMLElement>;
  onBlur?: NonNullable<TextFieldProps["onBlur"]>;
  onChange?: NonNullable<TextFieldProps["onChange"]>;
  readOnly?: boolean;
  /** Overrides the enclosing form's fallback for an empty read-only value. */
  readOnlyEmptyValue?: React.ReactNode;
  /** Replaces the default string presentation in read-only mode. */
  renderReadOnlyValue?: (value: string) => React.ReactNode;
  required?: boolean;
};

/** Props accepted by `field.TextField`. */
export type VireoFormTextFieldProps = VireoFormTextFieldOwnProps & VireoFormTextFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_TEXT_FIELD_NAME]?: VireoThemeComponent<
      VireoFormTextFieldProps,
      VireoFormTextFieldClassKey,
      VireoFormTextFieldOwnerState,
      Theme
    >;
  }
}
