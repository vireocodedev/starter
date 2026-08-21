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
  Radio,
  RadioGroup,
  RadioGroupProps,
  Typography,
} from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoFormRadioGroupFieldClasses,
  type VireoFormRadioGroupFieldClassKey,
} from "./VireoFormRadioGroupField.classes";
import type { VIREO_FORM_RADIO_GROUP_FIELD_NAME } from "./VireoFormRadioGroupField.identity";

/** Scalar values supported by `field.RadioGroupField`. Objects remain represented by their stable option value. */
export type VireoFormRadioGroupFieldValue = string | number;

export type VireoFormRadioGroupFieldOwnerState = {
  dirty: boolean;
  disabled: boolean;
  errorVisible: boolean;
  hasValue: boolean;
  invalid: boolean;
  row: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormRadioGroupFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormRadioGroupFieldRadioGroupSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormRadioGroupFieldFormControlLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormRadioGroupFieldRadioSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormRadioGroupFieldOptionLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormRadioGroupFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by the bound form radio-group field. */
export type VireoFormRadioGroupFieldSlots = {
  root: React.ElementType;
  radioGroup: React.ElementType;
  formControlLabel: React.ElementType;
  radio: React.ElementType;
  optionLabel: React.ElementType;
  formHelperText: React.ElementType;
};

/** Slot props exposed by the bound form radio-group field. */
export type VireoFormRadioGroupFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormRadioGroupFieldSlots,
  {
    /** @default FormControl */
    root: SlotProps<
      typeof FormControl,
      VireoFormRadioGroupFieldRootSlotPropsOverrides,
      VireoFormRadioGroupFieldOwnerState
    >;
    /** @default RadioGroup */
    radioGroup: SlotProps<
      typeof RadioGroup,
      VireoFormRadioGroupFieldRadioGroupSlotPropsOverrides,
      VireoFormRadioGroupFieldOwnerState
    >;
    /** @default FormControlLabel */
    formControlLabel: SlotProps<
      typeof FormControlLabel,
      VireoFormRadioGroupFieldFormControlLabelSlotPropsOverrides,
      VireoFormRadioGroupFieldOwnerState
    >;
    /** @default Radio */
    radio: SlotProps<typeof Radio, VireoFormRadioGroupFieldRadioSlotPropsOverrides, VireoFormRadioGroupFieldOwnerState>;
    /** @default Typography */
    optionLabel: SlotProps<
      typeof Typography,
      VireoFormRadioGroupFieldOptionLabelSlotPropsOverrides,
      VireoFormRadioGroupFieldOwnerState
    >;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormRadioGroupFieldFormHelperTextSlotPropsOverrides,
      VireoFormRadioGroupFieldOwnerState
    >;
  }
>;

type VireoFormRadioGroupFieldComponentOwnedProp =
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
  | "required"
  | "row"
  | "slotProps"
  | "slots"
  | "value";

/** Props VireoFormRadioGroupField inherits from its default root after excluding component-owned props. */
export type VireoFormRadioGroupFieldInheritedProps = Omit<FormControlProps, VireoFormRadioGroupFieldComponentOwnedProp>;

/** Accessible naming contract for the radio group itself. */
export type VireoFormRadioGroupFieldAccessibleNameProps =
  | {
      "aria-label": string;
      "aria-labelledby"?: string;
    }
  | {
      "aria-label"?: undefined;
      "aria-labelledby": string;
    };

/** Props owned by the bound form radio-group field. The field name and value remain owned by `form.Field`. */
export type VireoFormRadioGroupFieldOwnProps<
  TOption,
  TValue extends VireoFormRadioGroupFieldValue,
> = VireoFormRadioGroupFieldSlotsAndSlotProps & {
  /** Options rendered by the group. */
  options: readonly TOption[];
  /** Returns the stable unique scalar value stored by the form for one option. */
  getOptionValue: (option: TOption) => TValue;
  /** Renders the visible label for one option. */
  renderOption: (option: TOption) => React.ReactNode;
  /** Returns whether one option is unavailable. */
  getOptionDisabled?: (option: TOption) => boolean;
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoFormRadioGroupFieldClasses>;
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
  /** Places option controls horizontally. @default false */
  row?: boolean;
  /** @default 'end' */
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  onBlur?: NonNullable<RadioGroupProps["onBlur"]>;
  onChange?: NonNullable<RadioGroupProps["onChange"]>;
  /** Observes accepted option changes after cancelable handlers. */
  onValueChange?: (value: TValue) => void;
  required?: boolean;
  "aria-describedby"?: string;
};

/** Props accepted by `field.RadioGroupField`. */
export type VireoFormRadioGroupFieldProps<
  TOption = unknown,
  TValue extends VireoFormRadioGroupFieldValue = VireoFormRadioGroupFieldValue,
> = VireoFormRadioGroupFieldOwnProps<TOption, TValue> &
  VireoFormRadioGroupFieldAccessibleNameProps &
  VireoFormRadioGroupFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_RADIO_GROUP_FIELD_NAME]?: VireoThemeComponent<
      VireoFormRadioGroupFieldProps,
      VireoFormRadioGroupFieldClassKey,
      VireoFormRadioGroupFieldOwnerState,
      Theme
    >;
  }
}
