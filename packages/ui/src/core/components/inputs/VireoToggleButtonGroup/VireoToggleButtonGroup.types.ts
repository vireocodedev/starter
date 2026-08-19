import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type {
  FormControl,
  FormHelperText,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  FormControlProps,
  ToggleButtonProps,
} from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoToggleButtonGroupClasses, VireoToggleButtonGroupClassKey } from "./VireoToggleButtonGroup.classes";
import type { VIREO_TOGGLE_BUTTON_GROUP_NAME, VireoToggleButtonGroupSlotName } from "./VireoToggleButtonGroup.identity";
export type VireoToggleButtonGroupOwnerState = {
  disabled: boolean;
  error: boolean;
  multiple: boolean;
  hasValue: boolean;
};
export interface VireoToggleButtonGroupRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoToggleButtonGroupGroupSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoToggleButtonGroupOptionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoToggleButtonGroupClearButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoToggleButtonGroupHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoToggleButtonGroupSlots = { [T in VireoToggleButtonGroupSlotName]: React.ElementType };
export type VireoToggleButtonGroupSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoToggleButtonGroupSlots,
  {
    root: SlotProps<typeof FormControl, VireoToggleButtonGroupRootSlotPropsOverrides, VireoToggleButtonGroupOwnerState>;
    group: SlotProps<
      typeof ToggleButtonGroup,
      VireoToggleButtonGroupGroupSlotPropsOverrides,
      VireoToggleButtonGroupOwnerState
    >;
    option: SlotProps<
      typeof ToggleButton,
      VireoToggleButtonGroupOptionSlotPropsOverrides,
      VireoToggleButtonGroupOwnerState
    >;
    clearButton: SlotProps<
      typeof IconButton,
      VireoToggleButtonGroupClearButtonSlotPropsOverrides,
      VireoToggleButtonGroupOwnerState
    >;
    helperText: SlotProps<
      typeof FormHelperText,
      VireoToggleButtonGroupHelperTextSlotPropsOverrides,
      VireoToggleButtonGroupOwnerState
    >;
  }
>;
export type VireoToggleButtonGroupBaseProps<T> = VireoToggleButtonGroupSlotsAndSlotProps & {
  options: readonly T[];
  renderOption: (option: T) => React.ReactNode;
  renderKey: (option: T) => React.Key;
  getOptionProps?: (option: T) => Omit<ToggleButtonProps, "children" | "value">;
  disableClearable?: boolean;
  clearLabel?: string;
  helperText?: React.ReactNode;
  classes?: Partial<VireoToggleButtonGroupClasses>;
};
export type VireoToggleButtonGroupProps<T> = VireoToggleButtonGroupBaseProps<T> &
  Omit<FormControlProps, "children" | "classes" | "component" | "onChange" | "ref" | "value"> &
  (
    | { multiple: true; value: readonly T[]; onChange: (value: T[]) => void }
    | { multiple?: false; value: T | null; onChange: (value: T | null) => void }
  );
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_TOGGLE_BUTTON_GROUP_NAME]: VireoToggleButtonGroupProps<unknown>;
  }
  interface ComponentNameToClassKey {
    [VIREO_TOGGLE_BUTTON_GROUP_NAME]: VireoToggleButtonGroupClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_TOGGLE_BUTTON_GROUP_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_TOGGLE_BUTTON_GROUP_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_TOGGLE_BUTTON_GROUP_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_TOGGLE_BUTTON_GROUP_NAME];
    };
  }
}
