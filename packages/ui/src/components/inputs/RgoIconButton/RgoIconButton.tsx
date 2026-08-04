import { RgoIcon, type RgoIconProps } from "@/components/data-display/RgoIcon/RgoIcon";
import { composeSx } from "@/utils/muiutils";
import {
  Box,
  type BoxProps,
  Button,
  type ButtonProps,
  type Theme,
  Typography,
  type TypographyProps,
} from "@mui/material";
import React from "react";

export type RgoIconButtonSlotProps = Partial<{
  root: Omit<ButtonProps, "children" | "disabled" | "color">;
  rootContent: Omit<BoxProps, "children">;
  rootContentIcon: Omit<RgoIconProps, "children" | "icon">;
  rootContentStatusDot: Omit<BoxProps, "children">;
  label: Omit<TypographyProps, "children">;
}>;

export type RgoIconButtonProps = {
  onClick: () => void;
  label: string;
  color?: ButtonProps["color"];
  disabled?: boolean;
  icon?: RgoIconProps["icon"] | React.ReactNode;
  selected?: boolean;
  showStatusDot?: boolean;
  rgoSlotProps?: RgoIconButtonSlotProps;
};

/**
 * Stacked icon-over-label action button. The selected label color follows
 * `theme.palette.text.primary` (which already swaps on dark mode via the
 * theme provider) so the component has no dependency on app-level signals.
 */
export function RgoIconButton({
  onClick,
  icon,
  color,
  label,
  disabled = false,
  selected = false,
  showStatusDot = false,
  rgoSlotProps,
}: RgoIconButtonProps) {
  const rootProps = rgoSlotProps?.root ?? {};
  const rootContentProps = rgoSlotProps?.rootContent ?? {};
  const rootContentIconProps = rgoSlotProps?.rootContentIcon ?? {};
  const rootContentStatusDotProps = rgoSlotProps?.rootContentStatusDot ?? {};
  const labelProps = rgoSlotProps?.label ?? {};

  return (
    <Button
      {...rootProps}
      onClick={onClick}
      color={color}
      disabled={disabled}
      sx={composeSx(rootProps.sx, {
        flexDirection: "column",
        borderRadius: "8px",
        gap: "4px",
        minWidth: "88px",
        maxWidth: "88px",
        "&:hover": { backgroundColor: "action.hover" },
      })}
    >
      {(icon || showStatusDot) && (
        <Box
          {...rootContentProps}
          sx={composeSx(rootContentProps.sx, {
            borderRadius: "50%",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          {icon &&
            !showStatusDot &&
            (typeof icon == "string" ? (
              <RgoIcon
                {...rootContentIconProps}
                icon={icon as RgoIconProps["icon"]}
                stroke={rootContentIconProps.stroke || "var(--mui-palette-grey-500)"}
              />
            ) : (
              <Box sx={{ width: "24px", height: "24px" }}>{icon as React.ReactNode}</Box>
            ))}
          {showStatusDot && (
            <Box
              {...rootContentStatusDotProps}
              sx={composeSx(rootContentStatusDotProps.sx, {
                borderRadius: "50%",
                backgroundColor: "var(--mui-palette-success-500)",
                padding: "8px",
              })}
            />
          )}
        </Box>
      )}

      <Typography
        {...labelProps}
        sx={composeSx(labelProps.sx, (theme: Theme) => ({
          fontWeight: 400,
          fontSize: "0.75rem",
          lineHeight: "1.25rem",
          overflow: "hidden",
          color: disabled ? theme.palette.grey[400] : selected ? theme.palette.text.primary : theme.palette.grey[500],
        }))}
      >
        {label}
      </Typography>
    </Button>
  );
}
