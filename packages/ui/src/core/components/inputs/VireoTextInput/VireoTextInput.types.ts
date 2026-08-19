import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { TextField, TextFieldProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoTextInputClasses, VireoTextInputClassKey } from "./VireoTextInput.classes";
import type { VIREO_TEXT_INPUT_NAME, VireoTextInputSlotName } from "./VireoTextInput.identity";

export type VireoTextInputOwnerState = { disabled: boolean; error: boolean };
export interface VireoTextInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoTextInputSlots = { [T in VireoTextInputSlotName]: React.ElementType };
export type VireoTextInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoTextInputSlots,
  {
    /** @default TextField */ root: SlotProps<
      typeof TextField,
      VireoTextInputRootSlotPropsOverrides,
      VireoTextInputOwnerState
    >;
  }
>;
export type VireoTextInputOwnProps = VireoTextInputSlotsAndSlotProps & {
  value: string | null;
  onChange: (value: string) => void;
  classes?: Partial<VireoTextInputClasses>;
};
export type VireoTextInputInheritedProps = Omit<
  TextFieldProps,
  "classes" | "onChange" | "ref" | "slotProps" | "slots" | "value"
>;
export type VireoTextInputProps = VireoTextInputOwnProps & VireoTextInputInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_TEXT_INPUT_NAME]: VireoTextInputProps;
  }
  interface ComponentNameToClassKey {
    [VIREO_TEXT_INPUT_NAME]: VireoTextInputClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_TEXT_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_TEXT_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_TEXT_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_TEXT_INPUT_NAME];
    };
  }
}
