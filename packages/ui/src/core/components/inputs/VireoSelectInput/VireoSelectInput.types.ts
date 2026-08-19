import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type {
  FormControl,
  FormControlProps,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoSelectInputClasses, VireoSelectInputClassKey } from "./VireoSelectInput.classes";
import type { VIREO_SELECT_INPUT_NAME, VireoSelectInputSlotName } from "./VireoSelectInput.identity";

export type VireoSelectInputOwnerState = { disabled: boolean; error: boolean; hasValue: boolean };
export interface VireoSelectInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectInputLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectInputSelectSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectInputOptionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectInputOptionTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectInputClearButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectInputHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoSelectInputSlots = { [T in VireoSelectInputSlotName]: React.ElementType };
export type VireoSelectInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoSelectInputSlots,
  {
    root: SlotProps<typeof FormControl, VireoSelectInputRootSlotPropsOverrides, VireoSelectInputOwnerState>;
    label: SlotProps<typeof InputLabel, VireoSelectInputLabelSlotPropsOverrides, VireoSelectInputOwnerState>;
    select: SlotProps<typeof Select, VireoSelectInputSelectSlotPropsOverrides, VireoSelectInputOwnerState>;
    option: SlotProps<typeof MenuItem, VireoSelectInputOptionSlotPropsOverrides, VireoSelectInputOwnerState>;
    optionText: SlotProps<
      typeof ListItemText,
      VireoSelectInputOptionTextSlotPropsOverrides,
      VireoSelectInputOwnerState
    >;
    clearButton: SlotProps<
      typeof IconButton,
      VireoSelectInputClearButtonSlotPropsOverrides,
      VireoSelectInputOwnerState
    >;
    helperText: SlotProps<
      typeof FormHelperText,
      VireoSelectInputHelperTextSlotPropsOverrides,
      VireoSelectInputOwnerState
    >;
  }
>;
export type VireoSelectInputProps<TOption, TValue extends string | number> = VireoSelectInputSlotsAndSlotProps &
  Omit<FormControlProps, "children" | "classes" | "component" | "onChange" | "ref"> & {
    value: TValue | null;
    onChange: (value: TValue | null) => void;
    options: readonly TOption[];
    getOptionValue: (option: TOption) => TValue;
    renderOption: (option: TOption) => React.ReactNode;
    label?: React.ReactNode;
    placeholder?: string;
    helperText?: React.ReactNode;
    disableClearable?: boolean;
    clearLabel?: string;
    inputRef?: React.Ref<HTMLInputElement>;
    classes?: Partial<VireoSelectInputClasses>;
  };
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_SELECT_INPUT_NAME]: VireoSelectInputProps<unknown, string | number>;
  }
  interface ComponentNameToClassKey {
    [VIREO_SELECT_INPUT_NAME]: VireoSelectInputClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_SELECT_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_SELECT_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_SELECT_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_SELECT_INPUT_NAME];
    };
  }
}
