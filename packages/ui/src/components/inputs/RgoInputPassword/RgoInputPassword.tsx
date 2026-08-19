import { VireoPasswordInput, type VireoPasswordInputProps } from "@/core/components/inputs/VireoPasswordInput";
import type { TextFieldProps } from "@mui/material";
import React from "react";
export type RgoInputPasswordSlotProps = { root: Omit<TextFieldProps, "inputRef" | "onChange" | "type" | "value"> };
export type RgoInputPasswordProps = Omit<VireoPasswordInputProps, "slotProps" | "slots"> & {
  rgoSlotProps?: Partial<RgoInputPasswordSlotProps>;
};
/** @deprecated Use VireoPasswordInput. */
export const RgoInputPassword = React.forwardRef<HTMLInputElement, RgoInputPasswordProps>(function RgoInputPassword(
  { rgoSlotProps, ...props },
  ref,
) {
  return <VireoPasswordInput {...props} ref={ref} slotProps={{ root: rgoSlotProps?.root }} />;
});
