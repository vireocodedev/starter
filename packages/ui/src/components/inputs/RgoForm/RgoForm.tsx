import { type UseFormReturn } from "@/hooks/useRgoForm/useRgoForm";
import { composeSx } from "@/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import React from "react";
import { type FieldValues } from "react-hook-form";
import "./RgoForm.css";

export type RgoFormSlotProps = {
  form: Omit<BoxProps<"form">, "children" | "onSubmit" | "component">;
};

export type RgoFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: (request: T) => void | Promise<void>;
  children: React.ReactNode;
  enablePropagation?: boolean;
  rgoSlotProps?: RgoFormSlotProps;
};

export function RgoForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  enablePropagation = false,
  rgoSlotProps,
}: RgoFormProps<T>) {
  const formProps = rgoSlotProps?.form || {};
  const rhfHandleSubmit = form.handleSubmit;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!enablePropagation) e.stopPropagation();
    rhfHandleSubmit(onSubmit)(e);
  };

  return (
    <Box
      {...formProps}
      component="form"
      onSubmit={handleSubmit}
      sx={composeSx(formProps.sx, {
        position: "relative",
      })}
    >
      {children}
    </Box>
  );
}
