import { useVireoIcons } from "@/core/hooks/useVireoIcons/useVireoIcons";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoIconClassKey, getVireoIconUtilityClass } from "./VireoIcon.classes";
import { VIREO_ICON_NAME, type VireoIconSlotName } from "./VireoIcon.identity";
import { VireoIconRoot } from "./VireoIcon.styled";
import { type VireoIconOwnerState, type VireoIconProps } from "./VireoIcon.types";

function useUtilityClasses(_ownerState: VireoIconOwnerState, classes?: VireoIconProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoIconSlotName, VireoIconClassKey>,
    getVireoIconUtilityClass,
    classes,
  );
}

/** Renders a type-safe icon from the nearest Vireo icon registry. */
export const VireoIcon = React.forwardRef<SVGSVGElement, VireoIconProps>(function VireoIcon(inProps, forwardedRef) {
  const props = useThemeProps({ props: inProps, name: VIREO_ICON_NAME });
  const {
    className,
    classes: classesProp,
    fill = "none",
    height = 24,
    icon,
    slotProps = {},
    slots = {},
    stroke = "currentColor",
    style,
    sx,
    width = 24,
    ...other
  } = props;
  const { muiIconsMap } = useVireoIcons();
  const IconComponent = muiIconsMap[icon];

  if (!IconComponent) throw new Error(`Icon component for "${String(icon)}" was not registered.`);

  const ownerState: VireoIconOwnerState = { icon };
  const classes = useUtilityClasses(ownerState, classesProp);
  const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
  const {
    className: rootSlotClassName,
    ref: rootSlotRef,
    style: rootSlotStyle,
    sx: rootSlotSx,
    ...rootSlotOther
  } = resolvedRootSlotProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef);

  return (
    <VireoIconRoot
      {...other}
      {...rootSlotOther}
      as={slots.root ?? IconComponent}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootSlotClassName)}
      fill={fill}
      stroke={stroke}
      width={width}
      height={height}
      style={{ ...style, ...rootSlotStyle }}
      sx={mergeSx(sx, rootSlotSx)}
    />
  );
});

VireoIcon.displayName = VIREO_ICON_NAME;
