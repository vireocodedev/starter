import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type {
  FormControl,
  FormControlProps,
  FormHelperText,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  ToggleButtonProps,
} from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoFormToggleButtonGroupFieldClasses,
  type VireoFormToggleButtonGroupFieldClassKey,
} from "./VireoFormToggleButtonGroupField.classes";
import type { VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME } from "./VireoFormToggleButtonGroupField.identity";

/** Scalar option identifiers supported by `field.ToggleButtonGroupField`. */
export type VireoFormToggleButtonGroupFieldValue = string | number;

/** One ordered choice rendered by `field.ToggleButtonGroupField`. */
export type VireoFormToggleButtonGroupFieldOption<TValue extends VireoFormToggleButtonGroupFieldValue> = {
  value: TValue;
  label: React.ReactNode;
  disabled?: boolean;
  /** Accessible name for icon-only or otherwise non-descriptive visible content. */
  ariaLabel?: string;
};

export type VireoFormToggleButtonGroupFieldOptionState = {
  selected: boolean;
  disabled: boolean;
  index: number;
};

export type VireoFormToggleButtonGroupFieldOwnerState = {
  color: NonNullable<ToggleButtonGroupProps["color"]>;
  dirty: boolean;
  disabled: boolean;
  disableClearable: boolean;
  errorVisible: boolean;
  fullWidth: boolean;
  hasValue: boolean;
  invalid: boolean;
  multiple: boolean;
  orientation: NonNullable<ToggleButtonGroupProps["orientation"]>;
  readOnly: boolean;
  required: boolean;
  size: NonNullable<ToggleButtonGroupProps["size"]>;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormToggleButtonGroupFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormToggleButtonGroupFieldToggleButtonGroupSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormToggleButtonGroupFieldToggleButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormToggleButtonGroupFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by the bound toggle-button-group field. */
export type VireoFormToggleButtonGroupFieldSlots = {
  root: React.ElementType;
  toggleButtonGroup: React.ElementType;
  toggleButton: React.ElementType;
  formHelperText: React.ElementType;
};

/** Slot props exposed by the bound toggle-button-group field. */
export type VireoFormToggleButtonGroupFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormToggleButtonGroupFieldSlots,
  {
    /** @default FormControl */
    root: SlotProps<
      typeof FormControl,
      VireoFormToggleButtonGroupFieldRootSlotPropsOverrides,
      VireoFormToggleButtonGroupFieldOwnerState
    >;
    /** @default ToggleButtonGroup */
    toggleButtonGroup: SlotProps<
      typeof ToggleButtonGroup,
      VireoFormToggleButtonGroupFieldToggleButtonGroupSlotPropsOverrides,
      VireoFormToggleButtonGroupFieldOwnerState
    >;
    /** @default ToggleButton */
    toggleButton: SlotProps<
      typeof ToggleButton,
      VireoFormToggleButtonGroupFieldToggleButtonSlotPropsOverrides,
      VireoFormToggleButtonGroupFieldOwnerState
    >;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormToggleButtonGroupFieldFormHelperTextSlotPropsOverrides,
      VireoFormToggleButtonGroupFieldOwnerState
    >;
  }
>;

type ComponentOwnedProp =
  | "aria-describedby"
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "classes"
  | "color"
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

/** Props inherited from FormControl after excluding form-owned and Vireo-owned props. */
export type VireoFormToggleButtonGroupFieldInheritedProps = Omit<FormControlProps, ComponentOwnedProp>;

/** Accessible naming contract for the toggle-button group itself. */
export type VireoFormToggleButtonGroupFieldAccessibleNameProps =
  { "aria-label": string; "aria-labelledby"?: string } | { "aria-label"?: undefined; "aria-labelledby": string };

type ProtectedToggleButtonProp = "children" | "disabled" | "onChange" | "selected" | "value";

export type VireoFormToggleButtonGroupFieldOptionProps = Omit<ToggleButtonProps, ProtectedToggleButtonProp> & {
  [key: `data-${string}`]: VireoDataAttributeValue;
};

export type VireoFormToggleButtonGroupFieldSharedProps<TValue extends VireoFormToggleButtonGroupFieldValue> =
  VireoFormToggleButtonGroupFieldSlotsAndSlotProps & {
    options: readonly VireoFormToggleButtonGroupFieldOption<TValue>[];
    renderOption?: (
      option: VireoFormToggleButtonGroupFieldOption<TValue>,
      state: VireoFormToggleButtonGroupFieldOptionState,
    ) => React.ReactNode;
    getOptionProps?: (
      option: VireoFormToggleButtonGroupFieldOption<TValue>,
      state: VireoFormToggleButtonGroupFieldOptionState,
    ) => VireoFormToggleButtonGroupFieldOptionProps;
    classes?: Partial<VireoFormToggleButtonGroupFieldClasses>;
    color?: ToggleButtonGroupProps["color"];
    disabled?: boolean;
    disableClearable?: boolean;
    error?: boolean;
    errorDisplay?: VireoFormErrorDisplay;
    formatError?: VireoFormErrorFormatter;
    /** @default true */
    fullWidth?: boolean;
    helperText?: React.ReactNode;
    orientation?: ToggleButtonGroupProps["orientation"];
    readOnly?: boolean;
    required?: boolean;
    size?: ToggleButtonGroupProps["size"];
    onBlur?: NonNullable<ToggleButtonGroupProps["onBlur"]>;
    "aria-describedby"?: string;
  };

export type VireoFormToggleButtonGroupFieldExclusiveProps<TValue extends VireoFormToggleButtonGroupFieldValue> =
  VireoFormToggleButtonGroupFieldSharedProps<TValue> & {
    multiple?: false;
    onChange?: (event: React.MouseEvent<HTMLElement>, value: TValue | null) => void;
    onValueChange?: (value: TValue | null) => void;
  };

export type VireoFormToggleButtonGroupFieldMultipleProps<TValue extends VireoFormToggleButtonGroupFieldValue> =
  VireoFormToggleButtonGroupFieldSharedProps<TValue> & {
    multiple: true;
    onChange?: (event: React.MouseEvent<HTMLElement>, value: TValue[]) => void;
    onValueChange?: (value: TValue[]) => void;
  };

/** Props accepted by `field.ToggleButtonGroupField`. */
export type VireoFormToggleButtonGroupFieldProps<
  TValue extends VireoFormToggleButtonGroupFieldValue = VireoFormToggleButtonGroupFieldValue,
> = (VireoFormToggleButtonGroupFieldExclusiveProps<TValue> | VireoFormToggleButtonGroupFieldMultipleProps<TValue>) &
  VireoFormToggleButtonGroupFieldAccessibleNameProps &
  VireoFormToggleButtonGroupFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME]?: VireoThemeComponent<
      VireoFormToggleButtonGroupFieldProps,
      VireoFormToggleButtonGroupFieldClassKey,
      VireoFormToggleButtonGroupFieldOwnerState,
      Theme
    >;
  }
}
