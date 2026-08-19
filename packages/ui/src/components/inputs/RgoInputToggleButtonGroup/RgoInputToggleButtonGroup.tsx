import {
  VireoToggleButtonGroup,
  type VireoToggleButtonGroupProps,
} from "@/core/components/inputs/VireoToggleButtonGroup";
import type { ToggleButtonProps } from "@mui/material";
import React from "react";
type VireoSlotProps<T> = NonNullable<VireoToggleButtonGroupProps<T>["slotProps"]>;
export type RgoInputToggleButtonGroupSlotProps<T extends NonNullable<unknown>> = {
  root?: VireoSlotProps<T>["root"];
  toggleButtonGroup?: VireoSlotProps<T>["group"];
  toggleButton?: ToggleButtonProps | ((option: T) => ToggleButtonProps);
  formHelperText?: VireoSlotProps<T>["helperText"];
};
export type RgoInputToggleButtonGroupBaseProps<T extends NonNullable<unknown>> = Pick<
  VireoToggleButtonGroupProps<T>,
  "disableClearable" | "options" | "renderKey" | "renderOption"
>;
export type RgoInputToggleButtonGroupMultipleProps<T extends NonNullable<unknown>> = Extract<
  VireoToggleButtonGroupProps<T>,
  { multiple: true }
>;
export type RgoInputToggleButtonGroupSingleProps<T extends NonNullable<unknown>> = Extract<
  VireoToggleButtonGroupProps<T>,
  { multiple?: false }
>;
export type RgoInputToggleButtonGroupProps<T extends NonNullable<unknown>> = Omit<
  VireoToggleButtonGroupProps<T>,
  "getOptionProps" | "slotProps" | "slots"
> & { rgoSlotProps?: RgoInputToggleButtonGroupSlotProps<T> };
/** @deprecated Use VireoToggleButtonGroup. */
export const RgoInputToggleButtonGroup = React.forwardRef(function RgoInputToggleButtonGroup<
  T extends NonNullable<unknown>,
>({ rgoSlotProps, ...props }: RgoInputToggleButtonGroupProps<T>, ref: React.ForwardedRef<HTMLDivElement>) {
  const option = rgoSlotProps?.toggleButton;
  const staticOptionProps = typeof option === "function" ? undefined : option;
  const adaptedProps = {
    ...props,
    getOptionProps: typeof option === "function" ? option : undefined,
    slotProps: {
      root: rgoSlotProps?.root,
      group: rgoSlotProps?.toggleButtonGroup,
      option: staticOptionProps as unknown as VireoSlotProps<T>["option"],
      helperText: rgoSlotProps?.formHelperText,
    },
  } as VireoToggleButtonGroupProps<T>;
  return <VireoToggleButtonGroup {...adaptedProps} ref={ref} />;
}) as <T extends NonNullable<unknown>>(
  props: RgoInputToggleButtonGroupProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
