import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import { Box, FormControl, FormHelperText, Slider, TextField, type FormControlProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoSliderInputClasses, VireoSliderInputClassKey } from "./VireoSliderInput.classes";
import type { VIREO_SLIDER_INPUT_NAME, VireoSliderInputSlotName } from "./VireoSliderInput.identity";
export type VireoSliderInputOwnerState = { disabled: boolean; error: boolean; value: number };
export interface VireoSliderInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSliderInputSliderIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSliderInputSliderSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSliderInputNumberInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSliderInputHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoSliderInputSlots = { [T in VireoSliderInputSlotName]: React.ElementType };
export type VireoSliderInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoSliderInputSlots,
  {
    root: SlotProps<typeof FormControl, VireoSliderInputRootSlotPropsOverrides, VireoSliderInputOwnerState>;
    sliderIcon: SlotProps<typeof Box, VireoSliderInputSliderIconSlotPropsOverrides, VireoSliderInputOwnerState>;
    slider: SlotProps<typeof Slider, VireoSliderInputSliderSlotPropsOverrides, VireoSliderInputOwnerState>;
    numberInput: SlotProps<typeof TextField, VireoSliderInputNumberInputSlotPropsOverrides, VireoSliderInputOwnerState>;
    helperText: SlotProps<
      typeof FormHelperText,
      VireoSliderInputHelperTextSlotPropsOverrides,
      VireoSliderInputOwnerState
    >;
  }
>;
export type VireoSliderInputOwnProps = VireoSliderInputSlotsAndSlotProps & {
  value: number | null;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  step: number;
  size?: "small" | "medium";
  sliderInputIcon?: React.ReactNode;
  numberInputIcon?: React.ReactNode;
  numberInputMaxWidth?: number;
  helperText?: React.ReactNode;
  classes?: Partial<VireoSliderInputClasses>;
};
export type VireoSliderInputInheritedProps = Omit<
  FormControlProps,
  "children" | "classes" | "component" | "onChange" | "ref" | "size" | "value"
>;
export type VireoSliderInputProps = VireoSliderInputOwnProps & VireoSliderInputInheritedProps;
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_SLIDER_INPUT_NAME]: VireoSliderInputProps;
  }
  interface ComponentNameToClassKey {
    [VIREO_SLIDER_INPUT_NAME]: VireoSliderInputClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_SLIDER_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_SLIDER_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_SLIDER_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_SLIDER_INPUT_NAME];
    };
  }
}
