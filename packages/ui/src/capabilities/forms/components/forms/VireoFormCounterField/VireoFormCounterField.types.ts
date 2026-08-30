import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { FormControl, FormControlProps, FormHelperText, IconButton, OutlinedInput, SvgIcon } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormCounterFieldClasses, type VireoFormCounterFieldClassKey } from "./VireoFormCounterField.classes";
import type { VIREO_FORM_COUNTER_FIELD_NAME } from "./VireoFormCounterField.identity";

export type VireoFormCounterFieldSize = "small" | "medium";

export type VireoFormCounterFieldOwnerState = {
  atMax: boolean;
  atMin: boolean;
  decrementDisabled: boolean;
  dirty: boolean;
  disabled: boolean;
  errorVisible: boolean;
  fullWidth: boolean;
  hasValue: boolean;
  incrementDisabled: boolean;
  invalid: boolean;
  max: number | undefined;
  min: number | undefined;
  readOnly: boolean;
  required: boolean;
  size: VireoFormCounterFieldSize;
  step: number;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormCounterFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormCounterFieldInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormCounterFieldDecrementButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormCounterFieldDecrementIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormCounterFieldHtmlInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormCounterFieldIncrementButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormCounterFieldIncrementIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormCounterFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by the bound counter field. */
export type VireoFormCounterFieldSlots = {
  root: React.ElementType;
  input: React.ElementType;
  decrementButton: React.ElementType;
  decrementIcon: React.ElementType;
  htmlInput: React.ElementType;
  incrementButton: React.ElementType;
  incrementIcon: React.ElementType;
  formHelperText: React.ElementType;
};

/** Slot props exposed by the bound counter field. */
export type VireoFormCounterFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormCounterFieldSlots,
  {
    /** @default FormControl */
    root: SlotProps<typeof FormControl, VireoFormCounterFieldRootSlotPropsOverrides, VireoFormCounterFieldOwnerState>;
    /** @default OutlinedInput */
    input: SlotProps<
      typeof OutlinedInput,
      VireoFormCounterFieldInputSlotPropsOverrides,
      VireoFormCounterFieldOwnerState
    >;
    /** @default IconButton */
    decrementButton: SlotProps<
      typeof IconButton,
      VireoFormCounterFieldDecrementButtonSlotPropsOverrides,
      VireoFormCounterFieldOwnerState
    >;
    /** @default RemoveIcon */
    decrementIcon: SlotProps<
      typeof SvgIcon,
      VireoFormCounterFieldDecrementIconSlotPropsOverrides,
      VireoFormCounterFieldOwnerState
    >;
    /** @default 'input' */
    htmlInput: SlotProps<"input", VireoFormCounterFieldHtmlInputSlotPropsOverrides, VireoFormCounterFieldOwnerState>;
    /** @default IconButton */
    incrementButton: SlotProps<
      typeof IconButton,
      VireoFormCounterFieldIncrementButtonSlotPropsOverrides,
      VireoFormCounterFieldOwnerState
    >;
    /** @default AddIcon */
    incrementIcon: SlotProps<
      typeof SvgIcon,
      VireoFormCounterFieldIncrementIconSlotPropsOverrides,
      VireoFormCounterFieldOwnerState
    >;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormCounterFieldFormHelperTextSlotPropsOverrides,
      VireoFormCounterFieldOwnerState
    >;
  }
>;

type ComponentOwnedProp =
  | "aria-describedby"
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "classes"
  | "component"
  | "defaultValue"
  | "disabled"
  | "error"
  | "fullWidth"
  | "name"
  | "onBlur"
  | "onChange"
  | "ref"
  | "required"
  | "size"
  | "slotProps"
  | "slots"
  | "value";

/** Props VireoFormCounterField inherits from its default root after excluding component-owned props. */
export type VireoFormCounterFieldInheritedProps = Omit<FormControlProps, ComponentOwnedProp>;

/** Accessible naming contract for the counter and its numeric input. */
export type VireoFormCounterFieldAccessibleNameProps =
  { "aria-label": string; "aria-labelledby"?: string } | { "aria-label"?: undefined; "aria-labelledby": string };

/** Props owned by the bound counter field. The field name and value remain owned by `form.Field`. */
export type VireoFormCounterFieldOwnProps = VireoFormCounterFieldSlotsAndSlotProps & {
  classes?: Partial<VireoFormCounterFieldClasses>;
  disabled?: boolean;
  /** Accessible label for the decrement control. @default 'Decrease' */
  decrementLabel?: string;
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
  /** Accessible label for the increment control. @default 'Increase' */
  incrementLabel?: string;
  /** Ref forwarded to the native numeric text input. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Largest value emitted by user interaction. */
  max?: number;
  /** Smallest value emitted by user interaction. */
  min?: number;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Called after a complete edit or step resolves to a different stored value. */
  onValueChange?: (value: number | null) => void;
  readOnly?: boolean;
  readOnlyEmptyValue?: React.ReactNode;
  renderReadOnlyValue?: (value: number) => React.ReactNode;
  required?: boolean;
  /** @default 'medium' */
  size?: VireoFormCounterFieldSize;
  /** Positive finite amount used by buttons and Arrow keys. @default 1 */
  step?: number;
  /** Additional description IDs applied to the numeric input. */
  "aria-describedby"?: string;
};

/** Props accepted by `field.CounterField`. */
export type VireoFormCounterFieldProps = VireoFormCounterFieldOwnProps &
  VireoFormCounterFieldAccessibleNameProps &
  VireoFormCounterFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_COUNTER_FIELD_NAME]?: VireoThemeComponent<
      VireoFormCounterFieldProps,
      VireoFormCounterFieldClassKey,
      VireoFormCounterFieldOwnerState,
      Theme
    >;
  }
}
