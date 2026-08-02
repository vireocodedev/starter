import { Box, useTheme, type Theme, type TypographyProps } from "@mui/material";
import type React from "react";
import "./RgoLabelBox.css";

export type RgoLabelBoxProps = {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  children: React.ReactNode;
  color?: string | ((theme: Theme) => string);
  required?: boolean;
  fontWeight?: TypographyProps["fontWeight"];
  className?: string;
  direction?: "row" | "column";
};

export function RgoLabelBox({
  label,
  children,
  helperText,
  color = "var(--mui-palette-text-primary)",
  required = false,
  fontWeight = 600,
  className,
}: RgoLabelBoxProps) {
  const theme = useTheme();
  const resolvedColor = typeof color === "function" ? color(theme) : color;

  return (
    <Box className={`label-input-group ${className ?? ""}`}>
      <Box
        className="input-label"
        sx={{
          fontWeight,
        }}
      >
        {label && (
          <Box className="input-label-text" sx={{ color: resolvedColor }}>
            {label}
            {required ? " *" : ""}
          </Box>
        )}
        {helperText && (
          <>
            {!label && <Box />}
            <Box className="input-label-helper">{helperText}</Box>
          </>
        )}
      </Box>
      <Box className="input-content">{children}</Box>
    </Box>
  );
}
