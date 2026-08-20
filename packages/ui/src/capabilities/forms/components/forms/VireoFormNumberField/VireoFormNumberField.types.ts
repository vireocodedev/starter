import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoDataAttributeValue } from "@/core/public";
import type { FormControl, FormHelperText, InputLabel, OutlinedInput, TextFieldProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormNumberFieldClasses, type VireoFormNumberFieldClassKey } from "./VireoFormNumberField.classes";
import type { VIREO_FORM_NUMBER_FIELD_NAME } from "./VireoFormNumberField.identity";

export type VireoFormNumberFieldOwnerState = {
  dirty: boolean;
  disabled: boolean;
  errorVisible: boolean;
  invalid: boolean;
  readOnly: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormNumberFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormNumberFieldInputLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormNumberFieldInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormNumberFieldHtmlInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormNumberFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by the bound form number field. */
export type VireoFormNumberFieldSlots = {
  root: React.ElementType;
  inputLabel: React.ElementType;
  input: React.ElementType;
  htmlInput: React.ElementType;
  formHelperText: React.ElementType;
};

/** Slot props exposed by the bound form number field. */
export type VireoFormNumberFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormNumberFieldSlots,
  {
    /** @default FormControl */
    root: SlotProps<typeof FormControl, VireoFormNumberFieldRootSlotPropsOverrides, VireoFormNumberFieldOwnerState>;
    /** @default InputLabel */
    inputLabel: SlotProps<
      typeof InputLabel,
      VireoFormNumberFieldInputLabelSlotPropsOverrides,
      VireoFormNumberFieldOwnerState
    >;
    /** @default OutlinedInput; follows `variant` for standard and filled fields. */
    input: SlotProps<typeof OutlinedInput, VireoFormNumberFieldInputSlotPropsOverrides, VireoFormNumberFieldOwnerState>;
    /** @default 'input' */
    htmlInput: SlotProps<"input", VireoFormNumberFieldHtmlInputSlotPropsOverrides, VireoFormNumberFieldOwnerState>;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormNumberFieldFormHelperTextSlotPropsOverrides,
      VireoFormNumberFieldOwnerState
    >;
  }
>;

type VireoFormNumberFieldComponentOwnedProp =
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
export type VireoFormNumberFieldInheritedProps = Omit<TextFieldProps, VireoFormNumberFieldComponentOwnedProp>;

/** Props owned by the bound form number field. The field name and value remain owned by `form.Field`. */
export type VireoFormNumberFieldOwnProps = VireoFormNumberFieldSlotsAndSlotProps & {
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoFormNumberFieldClasses>;
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
  /** Ref forwarded to the native input. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Largest value emitted to the bound field. */
  max?: number;
  /** Smallest value emitted to the bound field. */
  min?: number;
  onBlur?: NonNullable<TextFieldProps["onBlur"]>;
  onChange?: NonNullable<TextFieldProps["onChange"]>;
  readOnly?: boolean;
  required?: boolean;
};

/** Props accepted by `field.NumberField`. */
export type VireoFormNumberFieldProps = VireoFormNumberFieldOwnProps & VireoFormNumberFieldInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_FORM_NUMBER_FIELD_NAME]: VireoFormNumberFieldProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_FORM_NUMBER_FIELD_NAME]: VireoFormNumberFieldClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_FORM_NUMBER_FIELD_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_FORM_NUMBER_FIELD_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_FORM_NUMBER_FIELD_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_FORM_NUMBER_FIELD_NAME];
    };
  }
}
