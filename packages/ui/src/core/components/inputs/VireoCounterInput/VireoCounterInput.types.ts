import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import { IconButton, TextField, type TextFieldProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoCounterInputClasses, VireoCounterInputClassKey } from "./VireoCounterInput.classes";
import type { VIREO_COUNTER_INPUT_NAME, VireoCounterInputSlotName } from "./VireoCounterInput.identity";
export type VireoCounterInputOwnerState = { disabled: boolean; error: boolean; atMin: boolean; atMax: boolean };
export interface VireoCounterInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoCounterInputDecrementButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoCounterInputIncrementButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoCounterInputSlots = { [T in VireoCounterInputSlotName]: React.ElementType };
export type VireoCounterInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoCounterInputSlots,
  {
    root: SlotProps<typeof TextField, VireoCounterInputRootSlotPropsOverrides, VireoCounterInputOwnerState>;
    decrementButton: SlotProps<
      typeof IconButton,
      VireoCounterInputDecrementButtonSlotPropsOverrides,
      VireoCounterInputOwnerState
    >;
    incrementButton: SlotProps<
      typeof IconButton,
      VireoCounterInputIncrementButtonSlotPropsOverrides,
      VireoCounterInputOwnerState
    >;
  }
>;
export type VireoCounterInputOwnProps = VireoCounterInputSlotsAndSlotProps & {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  decrementLabel?: string;
  incrementLabel?: string;
  classes?: Partial<VireoCounterInputClasses>;
};
export type VireoCounterInputInheritedProps = Omit<
  TextFieldProps,
  "classes" | "onChange" | "ref" | "slotProps" | "slots" | "type" | "value"
>;
export type VireoCounterInputProps = VireoCounterInputOwnProps & VireoCounterInputInheritedProps;
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_COUNTER_INPUT_NAME]: VireoCounterInputProps;
  }
  interface ComponentNameToClassKey {
    [VIREO_COUNTER_INPUT_NAME]: VireoCounterInputClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_COUNTER_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_COUNTER_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_COUNTER_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_COUNTER_INPUT_NAME];
    };
  }
}
