import { VireoNumberInput, type VireoNumberInputProps } from "@/core/components/inputs/VireoNumberInput";
import type { TextFieldProps } from "@mui/material";
import React from "react";
export type RgoInputNumberSlotProps = { root: Omit<TextFieldProps, "inputRef" | "onChange" | "type" | "value"> };
export type RgoInputNumberProps = Omit<VireoNumberInputProps, "slotProps" | "slots"> & {
  rgoSlotProps?: Partial<RgoInputNumberSlotProps>;
};
/** @deprecated Use VireoNumberInput. */
export const RgoInputNumber = React.forwardRef<HTMLInputElement, RgoInputNumberProps>(function RgoInputNumber(
  { rgoSlotProps, ...props },
  ref,
) {
  return <VireoNumberInput {...props} ref={ref} slotProps={{ root: rgoSlotProps?.root }} />;
});
