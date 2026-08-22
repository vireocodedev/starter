import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { type SwipeableDrawerProps, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoBottomDrawerClassKey, getVireoBottomDrawerUtilityClass } from "./VireoBottomDrawer.classes";
import { VIREO_BOTTOM_DRAWER_NAME, type VireoBottomDrawerSlotName } from "./VireoBottomDrawer.identity";
import { VireoBottomDrawerPuller, VireoBottomDrawerRoot } from "./VireoBottomDrawer.styled";
import { type VireoBottomDrawerOwnerState, type VireoBottomDrawerProps } from "./VireoBottomDrawer.types";

const IS_IOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

function useUtilityClasses(ownerState: VireoBottomDrawerOwnerState, classes?: VireoBottomDrawerProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      puller: ["puller"],
    } as const satisfies UtilityClassSlotMap<VireoBottomDrawerSlotName, VireoBottomDrawerClassKey>,
    getVireoBottomDrawerUtilityClass,
    classes,
  );
}

/** Renders the standard swipeable Vireo bottom-sheet surface and grab handle. */
export const VireoBottomDrawer = React.forwardRef<HTMLDivElement, VireoBottomDrawerProps>(
  function VireoBottomDrawer(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_BOTTOM_DRAWER_NAME });
    const {
      children,
      className,
      classes: classesProp,
      height,
      keepMounted = false,
      maxHeight,
      onClose,
      onExited,
      onOpen,
      open,
      slotProps = {},
      slots = {},
      style,
      sx,
      useBackdrop = true,
      ...other
    } = props;

    const ownerState: VireoBottomDrawerOwnerState = {
      open,
      hasFixedHeight: height !== undefined,
      keepMounted,
      useBackdrop,
    };
    const classes = useUtilityClasses(ownerState, classesProp);
    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedPullerSlotProps = resolveSlotProps(slotProps.puller, ownerState);
    const {
      className: rootSlotClassName,
      onClose: rootSlotOnClose,
      onOpen: rootSlotOnOpen,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef as React.Ref<HTMLDivElement> | undefined);
    const { className: pullerSlotClassName, ...pullerSlotOther } = resolvedPullerSlotProps;

    const handleClose = React.useCallback<NonNullable<SwipeableDrawerProps["onClose"]>>(
      event => {
        rootSlotOnClose?.(event);
        if (!event.defaultPrevented) onClose();
      },
      [onClose, rootSlotOnClose],
    );
    const handleOpen = React.useCallback<NonNullable<SwipeableDrawerProps["onOpen"]>>(
      event => {
        rootSlotOnOpen?.(event);
        if (!event.defaultPrevented) onOpen?.();
      },
      [onOpen, rootSlotOnOpen],
    );

    return (
      <VireoBottomDrawerRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        anchor="bottom"
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        disableSwipeToOpen
        disableBackdropTransition={!IS_IOS}
        disableDiscovery={IS_IOS}
        hideBackdrop={!useBackdrop}
        keepMounted={keepMounted}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              ...(height ? { height } : {}),
              ...(maxHeight ? { maxHeight } : {}),
            },
          },
          transition: { onExited },
        }}
      >
        <VireoBottomDrawerPuller
          {...pullerSlotOther}
          as={slots.puller}
          ownerState={ownerState}
          className={joinClassNames(classes.puller, pullerSlotClassName)}
          aria-hidden="true"
        />
        {children}
      </VireoBottomDrawerRoot>
    );
  },
);

VireoBottomDrawer.displayName = VIREO_BOTTOM_DRAWER_NAME;
