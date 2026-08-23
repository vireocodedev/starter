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
  Switch,
  SwitchProps,
  Typography,
} from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormSwitchFieldClasses, type VireoFormSwitchFieldClassKey } from "./VireoFormSwitchField.classes";
import type { VIREO_FORM_SWITCH_FIELD_NAME } from "./VireoFormSwitchField.identity";

export type VireoFormSwitchFieldOwnerState = {
  checked: boolean;
  dirty: boolean;
  disabled: boolean;
  errorVisible: boolean;
  invalid: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormSwitchFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormSwitchFieldFormControlLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormSwitchFieldSwitchSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
  /** Compatibility alias merged into MUI's native `input` slot. */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Compatibility alias forwarded to MUI's native `input` slot. */
  inputRef?: React.Ref<HTMLInputElement>;
}

export interface VireoFormSwitchFieldLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormSwitchFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by the bound form switch field. */
export type VireoFormSwitchFieldSlots = {
  root: React.ElementType;
  formControlLabel: React.ElementType;
  switch: React.ElementType;
  label: React.ElementType;
  formHelperText: React.ElementType;
};

/** Slot props exposed by the bound form switch field. */
export type VireoFormSwitchFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormSwitchFieldSlots,
  {
    /** @default FormControl */
    root: SlotProps<typeof FormControl, VireoFormSwitchFieldRootSlotPropsOverrides, VireoFormSwitchFieldOwnerState>;
    /** @default FormControlLabel */
    formControlLabel: SlotProps<
      typeof FormControlLabel,
      VireoFormSwitchFieldFormControlLabelSlotPropsOverrides,
      VireoFormSwitchFieldOwnerState
    >;
    /** @default Switch */
    switch: SlotProps<typeof Switch, VireoFormSwitchFieldSwitchSlotPropsOverrides, VireoFormSwitchFieldOwnerState>;
    /** @default Typography */
    label: SlotProps<typeof Typography, VireoFormSwitchFieldLabelSlotPropsOverrides, VireoFormSwitchFieldOwnerState>;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormSwitchFieldFormHelperTextSlotPropsOverrides,
      VireoFormSwitchFieldOwnerState
    >;
  }
>;

type VireoFormSwitchFieldComponentOwnedProp =
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

/** Props VireoFormSwitchField inherits from its default root after excluding component-owned props. */
export type VireoFormSwitchFieldInheritedProps = Omit<FormControlProps, VireoFormSwitchFieldComponentOwnedProp>;

/** Props owned by the bound form switch field. The field name and checked value remain owned by `form.Field`. */
export type VireoFormSwitchFieldOwnProps = VireoFormSwitchFieldSlotsAndSlotProps & {
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoFormSwitchFieldClasses>;
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
  /** Visible accessible label rendered beside the switch. */
  label: React.ReactNode;
  /** @default 'end' */
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  onBlur?: NonNullable<SwitchProps["onBlur"]>;
  onChange?: NonNullable<SwitchProps["onChange"]>;
  required?: boolean;
};

/** Props accepted by `field.SwitchField`. */
export type VireoFormSwitchFieldProps = VireoFormSwitchFieldOwnProps & VireoFormSwitchFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_SWITCH_FIELD_NAME]?: VireoThemeComponent<
      VireoFormSwitchFieldProps,
      VireoFormSwitchFieldClassKey,
      VireoFormSwitchFieldOwnerState,
      Theme
    >;
  }
}
