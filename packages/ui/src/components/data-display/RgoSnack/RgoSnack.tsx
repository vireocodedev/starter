import { Box } from "@mui/material";
import React from "react";
import "./RgoSnack.css";

export type RgoSnackVariant = "default" | "error" | "info" | "success" | "warning";

export type RgoSnackProps = {
  message: string;
  variant?: RgoSnackVariant;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};

export function RgoSnack({ message, variant = "default", startAdornment, endAdornment }: RgoSnackProps) {
  return (
    <Box className="rgo-snack" data-variant={variant}>
      {startAdornment && <Box className="rgo-snack__adornment">{startAdornment}</Box>}
      {message}
      {endAdornment && <Box className="rgo-snack__adornment">{endAdornment}</Box>}
    </Box>
  );
}
