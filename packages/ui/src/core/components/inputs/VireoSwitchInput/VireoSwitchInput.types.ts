import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { FormControl, FormControlProps, FormHelperText, Switch, Typography } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoSwitchInputClasses, VireoSwitchInputClassKey } from "./VireoSwitchInput.classes";
import type { VIREO_SWITCH_INPUT_NAME, VireoSwitchInputSlotName } from "./VireoSwitchInput.identity";
export type VireoSwitchInputOwnerState = { checked: boolean; disabled: boolean; error: boolean };
export interface VireoSwitchInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSwitchInputControlSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSwitchInputLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSwitchInputHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoSwitchInputSlots = { [T in VireoSwitchInputSlotName]: React.ElementType };
export type VireoSwitchInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoSwitchInputSlots,
  {
    root: SlotProps<typeof FormControl, VireoSwitchInputRootSlotPropsOverrides, VireoSwitchInputOwnerState>;
    control: SlotProps<typeof Switch, VireoSwitchInputControlSlotPropsOverrides, VireoSwitchInputOwnerState>;
    label: SlotProps<typeof Typography, VireoSwitchInputLabelSlotPropsOverrides, VireoSwitchInputOwnerState>;
    helperText: SlotProps<
      typeof FormHelperText,
      VireoSwitchInputHelperTextSlotPropsOverrides,
      VireoSwitchInputOwnerState
    >;
  }
>;
export type VireoSwitchInputOwnProps = VireoSwitchInputSlotsAndSlotProps & {
  value: boolean | null;
  onChange: (value: boolean) => void;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  classes?: Partial<VireoSwitchInputClasses>;
};
export type VireoSwitchInputInheritedProps = Omit<
  FormControlProps,
  "children" | "classes" | "component" | "onChange" | "ref" | "slotProps" | "slots" | "value"
>;
export type VireoSwitchInputProps = VireoSwitchInputOwnProps & VireoSwitchInputInheritedProps;
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_SWITCH_INPUT_NAME]: VireoSwitchInputProps;
  }
  interface ComponentNameToClassKey {
    [VIREO_SWITCH_INPUT_NAME]: VireoSwitchInputClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_SWITCH_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_SWITCH_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_SWITCH_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_SWITCH_INPUT_NAME];
    };
  }
}
