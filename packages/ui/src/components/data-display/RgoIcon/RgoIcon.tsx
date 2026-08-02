import { useRgoIcons } from "@/hooks/useRgoIcons/useRgoIcons";
import { type RgoIconName } from "@/providers/RgoIconsProvider/RgoIconsProvider";
import { type SvgIcon, type SvgIconProps } from "@mui/material";
import React from "react";
import "./RgoIcon.css";

export type RgoIconProps = SvgIconProps & {
  icon: RgoIconName;
};

export function RgoIcon({
  icon,
  stroke = "currentColor",
  fill = "none",
  width = 24,
  height = 24,
  ...props
}: RgoIconProps) {
  const icons = useRgoIcons();

  const IconComponent = React.useMemo(() => {
    const Component = icons.muiIconsMap[icon];
    if (!Component) throw new Error(`Icon component for "${icon}" not found.`);
    return Component as typeof SvgIcon;
  }, [icon, icons]);

  return (
    <IconComponent
      {...props}
      sx={{
        ...(props.sx ?? {}),
        fill,
        stroke,
        width,
        height,
      }}
    />
  );
}
