import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { TimePickerProps } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoTimeInputClasses, type VireoTimeInputClassKey } from "./VireoTimeInput.classes";
import type { VIREO_TIME_INPUT_NAME, VireoTimeInputSlotName } from "./VireoTimeInput.identity";

export type VireoTimeInputOwnerState = { disabled: boolean; error: boolean; hasValue: boolean };

export interface VireoTimeInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoTimeInput}. */
export type VireoTimeInputSlots = {
  [TSlotName in VireoTimeInputSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoTimeInput}. */
export type VireoTimeInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoTimeInputSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoTimeInputRootSlotPropsOverrides, VireoTimeInputOwnerState>;
  }
>;

/** Props owned by {@link VireoTimeInput}. */
export type VireoTimeInputOwnProps = VireoTimeInputSlotsAndSlotProps & {
  value: number | null;
  onChange: (value: number | null) => void;
  refDateMax?: number | null;
  refDateMin?: number | null;
  allowedRefDateOffsetMs?: number | null;
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  pickerProps?: Omit<TimePickerProps<Dayjs>, "ampm" | "format" | "inputRef" | "onChange" | "value">;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoTimeInputClasses>;
};

/** Props VireoTimeInput inherits from its default root after excluding component-owned props. */
export type VireoTimeInputInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "onChange">;

/** Props accepted by {@link VireoTimeInput}. */
export type VireoTimeInputProps = VireoTimeInputOwnProps & VireoTimeInputInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_TIME_INPUT_NAME]: VireoTimeInputProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_TIME_INPUT_NAME]: VireoTimeInputClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_TIME_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_TIME_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_TIME_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_TIME_INPUT_NAME];
    };
  }
}
