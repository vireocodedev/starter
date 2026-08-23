import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type {
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormControlProps,
  FormHelperText,
  Checkbox,
  CheckboxProps,
  Typography,
} from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoFormCheckboxFieldClasses,
  type VireoFormCheckboxFieldClassKey,
} from "./VireoFormCheckboxField.classes";
import type { VIREO_FORM_CHECKBOX_FIELD_NAME } from "./VireoFormCheckboxField.identity";

export type VireoFormCheckboxFieldOwnerState = {
  checked: boolean;
  dirty: boolean;
  disabled: boolean;
  errorVisible: boolean;
  invalid: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormCheckboxFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormCheckboxFieldFormControlLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormCheckboxFieldCheckboxSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
  /** Compatibility alias merged into MUI's native `input` slot. */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Compatibility alias forwarded to MUI's native `input` slot. */
  inputRef?: React.Ref<HTMLInputElement>;
}

export interface VireoFormCheckboxFieldLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormCheckboxFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by the bound form checkbox field. */
export type VireoFormCheckboxFieldSlots = {
  root: React.ElementType;
  formControlLabel: React.ElementType;
  checkbox: React.ElementType;
  label: React.ElementType;
  formHelperText: React.ElementType;
};

/** Slot props exposed by the bound form checkbox field. */
export type VireoFormCheckboxFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormCheckboxFieldSlots,
  {
    /** @default FormControl */
    root: SlotProps<typeof FormControl, VireoFormCheckboxFieldRootSlotPropsOverrides, VireoFormCheckboxFieldOwnerState>;
    /** @default FormControlLabel */
    formControlLabel: SlotProps<
      typeof FormControlLabel,
      VireoFormCheckboxFieldFormControlLabelSlotPropsOverrides,
      VireoFormCheckboxFieldOwnerState
    >;
    /** @default Checkbox */
    checkbox: SlotProps<
      typeof Checkbox,
      VireoFormCheckboxFieldCheckboxSlotPropsOverrides,
      VireoFormCheckboxFieldOwnerState
    >;
    /** @default Typography */
    label: SlotProps<
      typeof Typography,
      VireoFormCheckboxFieldLabelSlotPropsOverrides,
      VireoFormCheckboxFieldOwnerState
    >;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormCheckboxFieldFormHelperTextSlotPropsOverrides,
      VireoFormCheckboxFieldOwnerState
    >;
  }
>;

type VireoFormCheckboxFieldComponentOwnedProp =
  | "children"
  | "classes"
  | "component"
  | "disabled"
  | "error"
  | "fullWidth"
  | "onBlur"
  | "onChange"
  | "required"
  | "slotProps"
  | "slots";

/** Props VireoFormCheckboxField inherits from its default root after excluding component-owned props. */
export type VireoFormCheckboxFieldInheritedProps = Omit<FormControlProps, VireoFormCheckboxFieldComponentOwnedProp>;

/** Props owned by the bound form checkbox field. The field name and checked value remain owned by `form.Field`. */
export type VireoFormCheckboxFieldOwnProps = VireoFormCheckboxFieldSlotsAndSlotProps & {
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoFormCheckboxFieldClasses>;
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
  /** Ref forwarded to the native checkbox input. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Visible accessible label rendered beside the checkbox. */
  label: React.ReactNode;
  /** @default 'end' */
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  onBlur?: NonNullable<CheckboxProps["onBlur"]>;
  onChange?: NonNullable<CheckboxProps["onChange"]>;
  required?: boolean;
};

/** Props accepted by `field.CheckboxField`. */
export type VireoFormCheckboxFieldProps = VireoFormCheckboxFieldOwnProps & VireoFormCheckboxFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_CHECKBOX_FIELD_NAME]?: VireoThemeComponent<
      VireoFormCheckboxFieldProps,
      VireoFormCheckboxFieldClassKey,
      VireoFormCheckboxFieldOwnerState,
      Theme
    >;
  }
}
