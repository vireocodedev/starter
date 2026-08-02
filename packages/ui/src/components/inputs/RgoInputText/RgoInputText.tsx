import { type RgoInputProps } from "@/utils/formutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { TextField, type TextFieldProps } from "@mui/material";
import React from "react";
import "./RgoInputText.css";

export type RgoInputTextSlotProps = {
  root: Omit<TextFieldProps, keyof RgoInputProps | "inputRef">;
};

export type RgoInputTextProps = RgoInputProps<string | null, RgoInputTextSlotProps>;

function RgoInputTextImpl(
  { value, onChange, rgoSlotProps, ...controllerProps }: RgoInputTextProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const rootProps = rgoSlotProps?.root ?? {};

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return <TextField {...controllerProps} {...rootProps} inputRef={ref} value={value || ""} onChange={handleChange} />;
}

export const RgoInputText = fixedForwardRef(RgoInputTextImpl);
