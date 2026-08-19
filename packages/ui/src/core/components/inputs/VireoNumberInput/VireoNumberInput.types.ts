import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import { TextField, type TextFieldProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoNumberInputClasses, VireoNumberInputClassKey } from "./VireoNumberInput.classes";
import type { VIREO_NUMBER_INPUT_NAME, VireoNumberInputSlotName } from "./VireoNumberInput.identity";
export type VireoNumberInputOwnerState = { disabled: boolean; error: boolean };
export interface VireoNumberInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoNumberInputSlots = { [T in VireoNumberInputSlotName]: React.ElementType };
export type VireoNumberInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoNumberInputSlots,
  { root: SlotProps<typeof TextField, VireoNumberInputRootSlotPropsOverrides, VireoNumberInputOwnerState> }
>;
export type VireoNumberInputOwnProps = VireoNumberInputSlotsAndSlotProps & {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  classes?: Partial<VireoNumberInputClasses>;
};
export type VireoNumberInputInheritedProps = Omit<
  TextFieldProps,
  "classes" | "onChange" | "ref" | "slotProps" | "slots" | "type" | "value"
>;
export type VireoNumberInputProps = VireoNumberInputOwnProps & VireoNumberInputInheritedProps;
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_NUMBER_INPUT_NAME]: VireoNumberInputProps;
  }
  interface ComponentNameToClassKey {
    [VIREO_NUMBER_INPUT_NAME]: VireoNumberInputClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_NUMBER_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_NUMBER_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_NUMBER_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_NUMBER_INPUT_NAME];
    };
  }
}
