import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { DateTimePickerProps } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoDateTimeInputClasses, type VireoDateTimeInputClassKey } from "./VireoDateTimeInput.classes";
import type { VIREO_DATE_TIME_INPUT_NAME, VireoDateTimeInputSlotName } from "./VireoDateTimeInput.identity";

export type VireoDateTimeInputOwnerState = { disabled: boolean; error: boolean; hasValue: boolean };

export interface VireoDateTimeInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoDateTimeInput}. */
export type VireoDateTimeInputSlots = {
  [TSlotName in VireoDateTimeInputSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoDateTimeInput}. */
export type VireoDateTimeInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoDateTimeInputSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoDateTimeInputRootSlotPropsOverrides, VireoDateTimeInputOwnerState>;
  }
>;

/** Props owned by {@link VireoDateTimeInput}. */
export type VireoDateTimeInputOwnProps = VireoDateTimeInputSlotsAndSlotProps & {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  pickerProps?: Omit<DateTimePickerProps<Dayjs>, "inputRef" | "onChange" | "value">;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoDateTimeInputClasses>;
};

/** Props VireoDateTimeInput inherits from its default root after excluding component-owned props. */
export type VireoDateTimeInputInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "onChange">;

/** Props accepted by {@link VireoDateTimeInput}. */
export type VireoDateTimeInputProps = VireoDateTimeInputOwnProps & VireoDateTimeInputInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_DATE_TIME_INPUT_NAME]: VireoDateTimeInputProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_DATE_TIME_INPUT_NAME]: VireoDateTimeInputClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_DATE_TIME_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_DATE_TIME_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_DATE_TIME_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_DATE_TIME_INPUT_NAME];
    };
  }
}
