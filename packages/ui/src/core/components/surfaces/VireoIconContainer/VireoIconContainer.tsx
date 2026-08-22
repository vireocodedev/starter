import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoIconContainerClassKey, getVireoIconContainerUtilityClass } from "./VireoIconContainer.classes";
import { VIREO_ICON_CONTAINER_NAME, type VireoIconContainerSlotName } from "./VireoIconContainer.identity";
import { VireoIconContainerRoot } from "./VireoIconContainer.styled";
import { type VireoIconContainerOwnerState, type VireoIconContainerProps } from "./VireoIconContainer.types";

const STANDARD_ICON_VIEW_BOX_SIZE = 24;

function useUtilityClasses(_ownerState: VireoIconContainerOwnerState, classes?: VireoIconContainerProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoIconContainerSlotName, VireoIconContainerClassKey>,
    getVireoIconContainerUtilityClass,
    classes,
  );
}

/**
 * Proportionally scales and centers SVG geometry within Vireo's standard 24×24 icon coordinate system.
 */
export const VireoIconContainer = React.forwardRef<SVGGElement, VireoIconContainerProps>(
  function VireoIconContainer(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_ICON_CONTAINER_NAME });
    const {
      children,
      className,
      classes: classesProp,
      slotProps = {},
      slots = {},
      style,
      sx,
      viewBoxHeight,
      viewBoxWidth,
      ...other
    } = props;

    const ownerState: VireoIconContainerOwnerState = { viewBoxWidth, viewBoxHeight };
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
    const scale = Math.min(STANDARD_ICON_VIEW_BOX_SIZE / viewBoxWidth, STANDARD_ICON_VIEW_BOX_SIZE / viewBoxHeight);
    const offsetX = (STANDARD_ICON_VIEW_BOX_SIZE - viewBoxWidth * scale) / 2;
    const offsetY = (STANDARD_ICON_VIEW_BOX_SIZE - viewBoxHeight * scale) / 2;
    const transform = `translate(${offsetX} ${offsetY}) scale(${scale})`;

    return (
      <VireoIconContainerRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "g"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        transform={transform}
      >
        {children}
      </VireoIconContainerRoot>
    );
  },
);

VireoIconContainer.displayName = VIREO_ICON_CONTAINER_NAME;
