import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoStatusDotClassKey, getVireoStatusDotUtilityClass } from "./VireoStatusDot.classes";
import { VIREO_STATUS_DOT_NAME, type VireoStatusDotSlotName } from "./VireoStatusDot.identity";
import { VireoStatusDotRoot } from "./VireoStatusDot.styled";
import { type VireoStatusDotOwnerState, type VireoStatusDotProps } from "./VireoStatusDot.types";

function useUtilityClasses(ownerState: VireoStatusDotOwnerState, classes?: VireoStatusDotProps["classes"]) {
  return composeClasses(
    {
      root: ["root", ownerState.selected && "selected"],
    } as const satisfies UtilityClassSlotMap<VireoStatusDotSlotName, VireoStatusDotClassKey>,
    getVireoStatusDotUtilityClass,
    classes,
  );
}

/**
 * Displays a compact semantic status marker with theme-aware colors and optional standalone labelling.
 */
export const VireoStatusDot = React.forwardRef<HTMLSpanElement, VireoStatusDotProps>(
  function VireoStatusDot(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_STATUS_DOT_NAME });
    const {
      className,
      classes: classesProp,
      color,
      label,
      selected = false,
      size = 8,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const ownerState: VireoStatusDotOwnerState = {
      color,
      labeled: Boolean(label),
      selected,
      size,
    };
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
      <VireoStatusDotRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "span"}
        ref={rootRef}
        ownerState={ownerState}
        aria-hidden={label ? undefined : true}
        aria-label={label}
        role={label ? "img" : undefined}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      />
    );
  },
);

VireoStatusDot.displayName = VIREO_STATUS_DOT_NAME;
