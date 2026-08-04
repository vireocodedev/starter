import { composeSx } from "@/utils/muiutils";
import { type ButtonBaseProps, ButtonBase } from "@mui/material";
import React from "react";

type RgoButtonBaseColorMap = { standard: string; hover: string };

export type RgoButtonBaseColorSeverity = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type RgoButtonBaseColorMuiName =
  "primary" | "error" | "grey" | "secondary" | "info" | "success" | "warning" | "black" | "white";

function getMuiColorMapWithSeverity(
  muiColorName: RgoButtonBaseColorMuiName,
  severity: RgoButtonBaseColorSeverity,
): RgoButtonBaseColorMap {
  if (muiColorName === "black" || muiColorName === "white") {
    const colorValue = `var(--mui-palette-common-${muiColorName})`;
    const colorSeverity = muiColorName === "black" ? 200 : 300;
    return {
      standard: colorValue,
      hover: `var(--mui-palette-grey-${colorSeverity})`,
    };
  }

  const colorValue = `var(--mui-palette-${muiColorName}-${severity})`;
  return {
    standard: colorValue,
    hover: `var(--mui-palette-${muiColorName}-${Math.min(severity + 100, 900)})`,
  };
}

export type RgoButtonBaseProps = Omit<
  ButtonBaseProps,
  "component" | "onClick" | "tabIndex" | "disableRipple" | "color"
> &
  Partial<{
    component: ButtonBaseProps["component"];
    color: RgoButtonBaseColorMuiName;
    colorSeverity: RgoButtonBaseColorSeverity;
    onClick: () => void;
  }>;

export const RgoButtonBase = React.forwardRef<HTMLElement, RgoButtonBaseProps>(function RgoButtonBase(
  { component = "div", color = "grey", colorSeverity = 100, onClick, ...props },
  ref,
) {
  const isClickable = Boolean(onClick);
  const cursor = isClickable ? "pointer" : "default";
  const userSelect = isClickable ? "none" : "text";
  const tabIndex = isClickable ? 0 : -1;
  const colorMap = getMuiColorMapWithSeverity(color, colorSeverity);
  const { standard: backgroundColor, hover: hoverBackgroundColor } = colorMap;

  return (
    <ButtonBase
      {...props}
      ref={ref}
      component={component}
      disableRipple={!isClickable}
      onClick={onClick}
      tabIndex={tabIndex}
      sx={composeSx(props.sx, {
        cursor,
        userSelect,
        backgroundColor,
        "&:hover": {
          backgroundColor: hoverBackgroundColor,
        },
        "&.Mui-focusVisible": {
          backgroundColor: hoverBackgroundColor,
        },
      })}
    />
  );
});
