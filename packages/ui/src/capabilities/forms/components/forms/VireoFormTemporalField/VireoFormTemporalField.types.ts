import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps, FormHelperText, IconButton, SvgIcon, TextFieldProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type {
  DatePickerProps,
  DateTimePickerProps,
  DateTimeValidationError,
  DateValidationError,
  TimePickerProps,
  TimeValidationError,
  PickersOutlinedInput,
} from "@mui/x-date-pickers";
import type React from "react";
import {
  type VireoFormTemporalFieldClasses,
  type VireoFormTemporalFieldClassKey,
} from "./VireoFormTemporalField.classes";
import type { VIREO_FORM_TEMPORAL_FIELD_NAME, VireoFormTemporalFieldSlotName } from "./VireoFormTemporalField.identity";

export type VireoFormTemporalFieldMode = "year" | "month" | "year-month" | "date" | "time" | "date-time";
export type VireoFormTemporalFieldPrecision = "minute" | "second";
export type VireoFormTemporalFieldValue = string | null;
export type VireoFormTemporalFieldError = "invalid" | "min" | "max" | "minuteStep" | "secondStep";

export type VireoFormTemporalFieldOwnerState = {
  dirty: boolean;
  disabled: boolean;
  errorVisible: boolean;
  hasValue: boolean;
  invalid: boolean;
  mode: VireoFormTemporalFieldMode;
  readOnly: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormTemporalFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormTemporalFieldInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormTemporalFieldHtmlInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormTemporalFieldFormHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormTemporalFieldOpenPickerButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormTemporalFieldOpenPickerIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormTemporalFieldClearButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormTemporalFieldClearIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export type VireoFormTemporalFieldSlots = {
  [TSlotName in VireoFormTemporalFieldSlotName]: React.ElementType;
};

export type VireoFormTemporalFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormTemporalFieldSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoFormTemporalFieldRootSlotPropsOverrides, VireoFormTemporalFieldOwnerState>;
    /** @default PickersOutlinedInput; follows `variant` for standard and filled fields. */
    input: SlotProps<
      typeof PickersOutlinedInput,
      VireoFormTemporalFieldInputSlotPropsOverrides,
      VireoFormTemporalFieldOwnerState
    >;
    /** @default 'input' */
    htmlInput: SlotProps<"input", VireoFormTemporalFieldHtmlInputSlotPropsOverrides, VireoFormTemporalFieldOwnerState>;
    /** @default FormHelperText */
    formHelperText: SlotProps<
      typeof FormHelperText,
      VireoFormTemporalFieldFormHelperTextSlotPropsOverrides,
      VireoFormTemporalFieldOwnerState
    >;
    /** @default IconButton */
    openPickerButton: SlotProps<
      typeof IconButton,
      VireoFormTemporalFieldOpenPickerButtonSlotPropsOverrides,
      VireoFormTemporalFieldOwnerState
    >;
    /** @default CalendarIcon */
    openPickerIcon: SlotProps<
      typeof SvgIcon,
      VireoFormTemporalFieldOpenPickerIconSlotPropsOverrides,
      VireoFormTemporalFieldOwnerState
    >;
    /** @default IconButton */
    clearButton: SlotProps<
      typeof IconButton,
      VireoFormTemporalFieldClearButtonSlotPropsOverrides,
      VireoFormTemporalFieldOwnerState
    >;
    /** @default ClearIcon */
    clearIcon: SlotProps<
      typeof SvgIcon,
      VireoFormTemporalFieldClearIconSlotPropsOverrides,
      VireoFormTemporalFieldOwnerState
    >;
  }
>;

type VireoOwnedPickerProp =
  | "ampm"
  | "defaultValue"
  | "format"
  | "inputRef"
  | "maxDate"
  | "maxDateTime"
  | "maxTime"
  | "minDate"
  | "minDateTime"
  | "minTime"
  | "minutesStep"
  | "onAccept"
  | "onChange"
  | "onClose"
  | "onError"
  | "onOpen"
  | "openTo"
  | "readOnly"
  | "timeSteps"
  | "timezone"
  | "value"
  | "views";

export type VireoFormTemporalFieldDatePickerProps = Omit<DatePickerProps, VireoOwnedPickerProp>;
export type VireoFormTemporalFieldTimePickerProps = Omit<TimePickerProps, VireoOwnedPickerProp>;
export type VireoFormTemporalFieldDateTimePickerProps = Omit<DateTimePickerProps, VireoOwnedPickerProp>;

type VireoFormTemporalFieldCommonProps = VireoFormTemporalFieldSlotsAndSlotProps & {
  classes?: Partial<VireoFormTemporalFieldClasses>;
  disabled?: boolean;
  error?: boolean;
  errorDisplay?: VireoFormErrorDisplay;
  formatError?: VireoFormErrorFormatter;
  /** @default true */
  fullWidth?: boolean;
  /** Defaults to a reserved line; pass `null` to remove it. @default ' ' */
  helperText?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
  /** Inclusive canonical lower bound matching the selected mode. */
  min?: string;
  /** Inclusive canonical upper bound matching the selected mode. */
  max?: string;
  /** Called when focus leaves MUI X's accessible segmented input group. */
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  onValueChange?: (value: VireoFormTemporalFieldValue) => void;
  /** Canonical value used only to choose initial picker focus when the bound value is null. */
  referenceValue?: string;
  readOnly?: boolean;
  required?: boolean;
  /** @default true */
  clearable?: boolean;
  /** Accessible label for the clear action. @default 'Clear temporal value' */
  clearLabel?: string;
  variant?: TextFieldProps["variant"];
};

export type VireoFormTemporalFieldModeProps =
  | {
      mode: "year";
      openTo?: "year";
      pickerProps?: VireoFormTemporalFieldDatePickerProps;
      ampm?: never;
      precision?: never;
      minuteStep?: never;
      secondStep?: never;
    }
  | {
      mode: "month";
      openTo?: "month";
      pickerProps?: VireoFormTemporalFieldDatePickerProps;
      ampm?: never;
      precision?: never;
      minuteStep?: never;
      secondStep?: never;
    }
  | {
      mode: "year-month";
      openTo?: "year" | "month";
      pickerProps?: VireoFormTemporalFieldDatePickerProps;
      ampm?: never;
      precision?: never;
      minuteStep?: never;
      secondStep?: never;
    }
  | {
      mode: "date";
      openTo?: "year" | "month" | "day";
      pickerProps?: VireoFormTemporalFieldDatePickerProps;
      ampm?: never;
      precision?: never;
      minuteStep?: never;
      secondStep?: never;
    }
  | {
      mode: "time";
      openTo?: "hours" | "minutes" | "seconds";
      pickerProps?: VireoFormTemporalFieldTimePickerProps;
      /** @default false */
      ampm?: boolean;
      /** @default 'minute' */
      precision?: VireoFormTemporalFieldPrecision;
      /** @default 1 */
      minuteStep?: number;
      /** @default 1 */
      secondStep?: number;
    }
  | {
      mode: "date-time";
      openTo?: "year" | "month" | "day" | "hours" | "minutes" | "seconds";
      pickerProps?: VireoFormTemporalFieldDateTimePickerProps;
      /** @default false */
      ampm?: boolean;
      /** @default 'minute' */
      precision?: VireoFormTemporalFieldPrecision;
      /** @default 1 */
      minuteStep?: number;
      /** @default 1 */
      secondStep?: number;
    };

/** Props owned by the bound temporal form field. The field name and value remain owned by `form.Field`. */
export type VireoFormTemporalFieldOwnProps = VireoFormTemporalFieldCommonProps & VireoFormTemporalFieldModeProps;

/** Props VireoFormTemporalField inherits from its default root after excluding component-owned props. */
export type VireoFormTemporalFieldInheritedProps = Omit<
  BoxProps<"div">,
  "children" | "component" | "defaultValue" | "onChange" | "onError" | "value"
>;

/** Props accepted by `field.TemporalField`. */
export type VireoFormTemporalFieldProps = VireoFormTemporalFieldOwnProps & VireoFormTemporalFieldInheritedProps;

export type VireoFormTemporalFieldPickerError = DateValidationError | TimeValidationError | DateTimeValidationError;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_TEMPORAL_FIELD_NAME]?: VireoThemeComponent<
      VireoFormTemporalFieldProps,
      VireoFormTemporalFieldClassKey,
      VireoFormTemporalFieldOwnerState,
      Theme
    >;
  }
}
