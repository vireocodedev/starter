import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { TimeFieldProps, TimeView } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoDurationInputClasses, type VireoDurationInputClassKey } from "./VireoDurationInput.classes";
import type { VIREO_DURATION_INPUT_NAME, VireoDurationInputSlotName } from "./VireoDurationInput.identity";

export type VireoDurationInputOwnerState = { disabled: boolean; error: boolean; hasValue: boolean };

export interface VireoDurationInputRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoDurationInput}. */
export type VireoDurationInputSlots = {
  [TSlotName in VireoDurationInputSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoDurationInput}. */
export type VireoDurationInputSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoDurationInputSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoDurationInputRootSlotPropsOverrides, VireoDurationInputOwnerState>;
  }
>;

/** Props owned by {@link VireoDurationInput}. */
export type VireoDurationInputOwnProps = VireoDurationInputSlotsAndSlotProps & {
  value: number | null;
  onChange: (value: number | null) => void;
  durationUnit?: TimeView;
  durationViews?: readonly TimeView[];
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fieldProps?: Omit<TimeFieldProps<Dayjs>, "ampm" | "inputRef" | "onChange" | "value">;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoDurationInputClasses>;
};

/** Props VireoDurationInput inherits from its default root after excluding component-owned props. */
export type VireoDurationInputInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "onChange">;

/** Props accepted by {@link VireoDurationInput}. */
export type VireoDurationInputProps = VireoDurationInputOwnProps & VireoDurationInputInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_DURATION_INPUT_NAME]: VireoDurationInputProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_DURATION_INPUT_NAME]: VireoDurationInputClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_DURATION_INPUT_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_DURATION_INPUT_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_DURATION_INPUT_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_DURATION_INPUT_NAME];
    };
  }
}
