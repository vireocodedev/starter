import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoFormActionsClassKey, getVireoFormActionsUtilityClass } from "./VireoFormActions.classes";
import { VIREO_FORM_ACTIONS_NAME, type VireoFormActionsSlotName } from "./VireoFormActions.identity";
import { VireoFormActionsLayout, VireoFormActionsRoot } from "./VireoFormActions.styled";
import { type VireoFormActionsOwnerState, type VireoFormActionsProps } from "./VireoFormActions.types";

function useUtilityClasses(_ownerState: VireoFormActionsOwnerState, classes?: VireoFormActionsProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      layout: ["layout"],
    } as const satisfies UtilityClassSlotMap<VireoFormActionsSlotName, VireoFormActionsClassKey>,
    getVireoFormActionsUtilityClass,
    classes,
  );
}

/**
 * Keeps form actions in one horizontal row across every containing surface.
 */
export const VireoFormActions = React.forwardRef<HTMLDivElement, VireoFormActionsProps>(
  function VireoFormActions(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_ACTIONS_NAME });
    const { children, className, classes: classesProp, slotProps = {}, slots = {}, style, sx, ...other } = props;

    const ownerState: VireoFormActionsOwnerState = {};
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
    const resolvedLayoutSlotProps = resolveSlotProps(slotProps.layout, ownerState);
    const { className: layoutSlotClassName, ...layoutSlotOther } = resolvedLayoutSlotProps;

    return (
      <VireoFormActionsRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoFormActionsLayout
          {...layoutSlotOther}
          as={slots.layout}
          ownerState={ownerState}
          className={joinClassNames(classes.layout, layoutSlotClassName)}
        >
          {children}
        </VireoFormActionsLayout>
      </VireoFormActionsRoot>
    );
  },
);

VireoFormActions.displayName = VIREO_FORM_ACTIONS_NAME;
