import { VireoSwitchInput, type VireoSwitchInputProps } from "@/core/components/inputs/VireoSwitchInput";
import React from "react";
export type RgoInputSwitchValue = boolean | null;
export type RgoInputSwitchSlotProps = NonNullable<VireoSwitchInputProps["slotProps"]>;
export type RgoInputSwitchProps = Omit<VireoSwitchInputProps, "slotProps" | "slots"> & {
  rgoSlotProps?: RgoInputSwitchSlotProps;
};
/** @deprecated Use VireoSwitchInput. */
export const RgoInputSwitch = React.forwardRef<HTMLButtonElement, RgoInputSwitchProps>(function RgoInputSwitch(
  { rgoSlotProps, ...props },
  ref,
) {
  return <VireoSwitchInput {...props} ref={ref} slotProps={rgoSlotProps} />;
});
