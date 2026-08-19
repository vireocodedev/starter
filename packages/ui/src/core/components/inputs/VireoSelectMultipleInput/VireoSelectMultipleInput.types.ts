import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type {
  FormControl,
  FormControlProps,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type {
  VireoSelectMultipleInputClasses,
  VireoSelectMultipleInputClassKey,
} from "./VireoSelectMultipleInput.classes";
import type {
  VIREO_SELECT_MULTIPLE_INPUT_NAME,
  VireoSelectMultipleInputSlotName,
} from "./VireoSelectMultipleInput.identity";
export type VireoSelectMultipleInputOwnerState = { disabled: boolean; error: boolean; hasValue: boolean };
export interface VireoSelectMultipleInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectMultipleInputLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectMultipleInputSelectSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectMultipleInputOptionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectMultipleInputOptionTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSelectMultipleInputHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoSelectMultipleInputSlots = { [T in VireoSelectMultipleInputSlotName]: React.ElementType };
export type VireoSelectMultipleInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoSelectMultipleInputSlots,
  {
    root: SlotProps<
      typeof FormControl,
      VireoSelectMultipleInputRootSlotPropsOverrides,
      VireoSelectMultipleInputOwnerState
    >;
    label: SlotProps<
      typeof InputLabel,
      VireoSelectMultipleInputLabelSlotPropsOverrides,
      VireoSelectMultipleInputOwnerState
    >;
    select: SlotProps<
      typeof Select,
      VireoSelectMultipleInputSelectSlotPropsOverrides,
      VireoSelectMultipleInputOwnerState
    >;
    option: SlotProps<
      typeof MenuItem,
      VireoSelectMultipleInputOptionSlotPropsOverrides,
      VireoSelectMultipleInputOwnerState
    >;
    optionText: SlotProps<
      typeof ListItemText,
      VireoSelectMultipleInputOptionTextSlotPropsOverrides,
      VireoSelectMultipleInputOwnerState
    >;
    helperText: SlotProps<
      typeof FormHelperText,
      VireoSelectMultipleInputHelperTextSlotPropsOverrides,
      VireoSelectMultipleInputOwnerState
    >;
  }
>;
export type VireoSelectMultipleInputProps<
  TOption,
  TValue extends string | number,
> = VireoSelectMultipleInputSlotsAndSlotProps &
  Omit<FormControlProps, "children" | "classes" | "component" | "onChange" | "ref"> & {
    value: readonly TValue[];
    onChange: (value: TValue[]) => void;
    options: readonly TOption[];
    getOptionValue: (option: TOption) => TValue;
    renderOption: (option: TOption) => React.ReactNode;
    label?: React.ReactNode;
    placeholder?: string;
    helperText?: React.ReactNode;
    inputRef?: React.Ref<HTMLInputElement>;
    classes?: Partial<VireoSelectMultipleInputClasses>;
  };
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_SELECT_MULTIPLE_INPUT_NAME]: VireoSelectMultipleInputProps<unknown, string | number>;
  }
  interface ComponentNameToClassKey {
    [VIREO_SELECT_MULTIPLE_INPUT_NAME]: VireoSelectMultipleInputClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_SELECT_MULTIPLE_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_SELECT_MULTIPLE_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_SELECT_MULTIPLE_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_SELECT_MULTIPLE_INPUT_NAME];
    };
  }
}
