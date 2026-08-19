import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import { IconButton, TextField, type TextFieldProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoPasswordInputClasses, VireoPasswordInputClassKey } from "./VireoPasswordInput.classes";
import type { VIREO_PASSWORD_INPUT_NAME, VireoPasswordInputSlotName } from "./VireoPasswordInput.identity";
export type VireoPasswordInputOwnerState = { disabled: boolean; error: boolean; passwordVisible: boolean };
export interface VireoPasswordInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPasswordInputVisibilityButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoPasswordInputSlots = { [T in VireoPasswordInputSlotName]: React.ElementType };
export type VireoPasswordInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoPasswordInputSlots,
  {
    root: SlotProps<typeof TextField, VireoPasswordInputRootSlotPropsOverrides, VireoPasswordInputOwnerState>;
    visibilityButton: SlotProps<
      typeof IconButton,
      VireoPasswordInputVisibilityButtonSlotPropsOverrides,
      VireoPasswordInputOwnerState
    >;
  }
>;
export type VireoPasswordInputOwnProps = VireoPasswordInputSlotsAndSlotProps & {
  value: string | null;
  onChange: (value: string) => void;
  visibilityIcon?: React.ReactNode;
  visibilityOffIcon?: React.ReactNode;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  classes?: Partial<VireoPasswordInputClasses>;
};
export type VireoPasswordInputInheritedProps = Omit<
  TextFieldProps,
  "classes" | "onChange" | "ref" | "slotProps" | "slots" | "type" | "value"
>;
export type VireoPasswordInputProps = VireoPasswordInputOwnProps & VireoPasswordInputInheritedProps;
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_PASSWORD_INPUT_NAME]: VireoPasswordInputProps;
  }
  interface ComponentNameToClassKey {
    [VIREO_PASSWORD_INPUT_NAME]: VireoPasswordInputClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_PASSWORD_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_PASSWORD_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_PASSWORD_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_PASSWORD_INPUT_NAME];
    };
  }
}
