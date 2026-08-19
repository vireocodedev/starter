import { VireoTextInput, type VireoTextInputProps } from "@/core/components/inputs/VireoTextInput";
import type { TextFieldProps } from "@mui/material";
import React from "react";

export type RgoInputTextSlotProps = { root: Omit<TextFieldProps, "inputRef" | "onChange" | "value"> };
export type RgoInputTextProps = Omit<VireoTextInputProps, "slotProps" | "slots"> & {
  rgoSlotProps?: Partial<RgoInputTextSlotProps>;
};
/** @deprecated Use VireoTextInput. */
export const RgoInputText = React.forwardRef<HTMLInputElement, RgoInputTextProps>(function RgoInputText(
  { rgoSlotProps, ...props },
  ref,
) {
  return <VireoTextInput {...props} ref={ref} slotProps={{ root: rgoSlotProps?.root }} />;
});
