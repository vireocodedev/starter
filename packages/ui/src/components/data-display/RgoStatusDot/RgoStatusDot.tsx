import { Box } from "@mui/material";

export type RgoStatusDotProps = {
  color: "success" | "error" | "warning" | "info" | "standard";
  selected?: boolean;
  marginLeft?: number;
  marginRight?: number;
};

export function RgoStatusDot({ color, marginLeft, marginRight, selected = false }: RgoStatusDotProps) {
  const backgroundColor = selected
    ? "var(--mui-palette-common-white)"
    : color === "standard"
      ? "var(--mui-palette-common-black)"
      : `var(--mui-palette-${color}-main)`;

  return (
    <Box
      width="8px"
      height="8px"
      borderRadius="50%"
      marginLeft={marginLeft}
      marginRight={marginRight}
      sx={{ backgroundColor }}
    />
  );
}
