import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { DatePickerProps } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoDateInputClasses, type VireoDateInputClassKey } from "./VireoDateInput.classes";
import type { VIREO_DATE_INPUT_NAME, VireoDateInputSlotName } from "./VireoDateInput.identity";

export type VireoDateInputOwnerState = { disabled: boolean; error: boolean; hasValue: boolean };

export interface VireoDateInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoDateInput}. */
export type VireoDateInputSlots = {
  [TSlotName in VireoDateInputSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoDateInput}. */
export type VireoDateInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoDateInputSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoDateInputRootSlotPropsOverrides, VireoDateInputOwnerState>;
  }
>;

/** Props owned by {@link VireoDateInput}. */
export type VireoDateInputOwnProps = VireoDateInputSlotsAndSlotProps & {
  /** Unix timestamp in milliseconds, or null when no date is selected. */
  value: number | null;
  /** Receives the selected date as a Unix timestamp in milliseconds. */
  onChange: (value: number | null) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  /** Ref forwarded to the picker text input. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Props forwarded to MUI DatePicker after Vireo-owned value and validation props. */
  pickerProps?: Omit<DatePickerProps<Dayjs>, "inputRef" | "onChange" | "value">;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoDateInputClasses>;
};

/** Props VireoDateInput inherits from its default root after excluding component-owned props. */
export type VireoDateInputInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "onChange">;

/** Props accepted by {@link VireoDateInput}. */
export type VireoDateInputProps = VireoDateInputOwnProps & VireoDateInputInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_DATE_INPUT_NAME]: VireoDateInputProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_DATE_INPUT_NAME]: VireoDateInputClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_DATE_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_DATE_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_DATE_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_DATE_INPUT_NAME];
    };
  }
}
