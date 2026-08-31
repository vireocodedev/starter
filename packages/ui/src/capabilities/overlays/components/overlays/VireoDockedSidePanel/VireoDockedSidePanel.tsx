import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import {
  DOCKED_SIDE_PANEL_TRANSITION_EVENT,
  DOCKED_SIDE_PANEL_TRANSITION_MS,
  type DockedSidePanelTransitionEventDetail,
} from "@/capabilities/overlays/constants/overlay.constants";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoDockedSidePanelClassKey, getVireoDockedSidePanelUtilityClass } from "./VireoDockedSidePanel.classes";
import { VIREO_DOCKED_SIDE_PANEL_NAME, type VireoDockedSidePanelSlotName } from "./VireoDockedSidePanel.identity";
import { VireoDockedSidePanelRoot, VireoDockedSidePanelSurface } from "./VireoDockedSidePanel.styled";
import { type VireoDockedSidePanelOwnerState, type VireoDockedSidePanelProps } from "./VireoDockedSidePanel.types";

function useUtilityClasses(
  _ownerState: VireoDockedSidePanelOwnerState,
  classes?: VireoDockedSidePanelProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      surface: ["surface"],
    } as const satisfies UtilityClassSlotMap<VireoDockedSidePanelSlotName, VireoDockedSidePanelClassKey>,
    getVireoDockedSidePanelUtilityClass,
    classes,
  );
}

/**
 * Renders an adjacent side-panel surface with coordinated enter and exit transitions.
 */
export const VireoDockedSidePanel = React.forwardRef<HTMLDivElement, VireoDockedSidePanelProps>(
  function VireoDockedSidePanel(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_DOCKED_SIDE_PANEL_NAME });
    const {
      children,
      className,
      classes: classesProp,
      isResizing = false,
      maxWidth,
      minWidth,
      onExited,
      open,
      resizeHandle,
      slotProps = {},
      slots = {},
      style,
      sx,
      width,
      ...other
    } = props;

    const [isPanelPresent, setIsPanelPresent] = React.useState(open);
    const [isPanelEntered, setIsPanelEntered] = React.useState(false);
    const previousOpenRef = React.useRef(false);
    const exitedRef = React.useRef(false);
    const exitTimerRef = React.useRef<number | null>(null);
    const transitionTimerRef = React.useRef<number | null>(null);
    const transitionRafRef = React.useRef<number | null>(null);
    const isTransitioningRef = React.useRef(false);
    const onExitedRef = React.useRef(onExited);

    React.useEffect(() => {
      onExitedRef.current = onExited;
    }, [onExited]);

    const clearExitTimer = React.useCallback(() => {
      if (exitTimerRef.current === null || typeof window === "undefined") return;
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }, []);
    const clearTransitionTimer = React.useCallback(() => {
      if (transitionTimerRef.current === null || typeof window === "undefined") return;
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }, []);
    const clearTransitionRaf = React.useCallback(() => {
      if (transitionRafRef.current === null || typeof window === "undefined") return;
      window.cancelAnimationFrame(transitionRafRef.current);
      transitionRafRef.current = null;
    }, []);
    const emitTransitionState = React.useCallback((animating: boolean) => {
      if (typeof window === "undefined" || animating === isTransitioningRef.current) return;
      isTransitioningRef.current = animating;
      window.dispatchEvent(
        new CustomEvent<DockedSidePanelTransitionEventDetail>(DOCKED_SIDE_PANEL_TRANSITION_EVENT, {
          detail: { animating },
        }),
      );
    }, []);
    const endTransition = React.useCallback(() => {
      clearTransitionTimer();
      emitTransitionState(false);
    }, [clearTransitionTimer, emitTransitionState]);
    const beginTransition = React.useCallback(() => {
      if (typeof window === "undefined") return;
      clearTransitionTimer();
      emitTransitionState(true);
      transitionTimerRef.current = window.setTimeout(endTransition, DOCKED_SIDE_PANEL_TRANSITION_MS + 80);
    }, [clearTransitionTimer, emitTransitionState, endTransition]);
    const emitExited = React.useCallback(() => {
      if (exitedRef.current) return;
      exitedRef.current = true;
      clearExitTimer();
      onExitedRef.current?.();
    }, [clearExitTimer]);
    const finalizeClose = React.useCallback(() => {
      if (open) return;
      setIsPanelPresent(false);
      emitExited();
      endTransition();
    }, [emitExited, endTransition, open]);

    React.useEffect(() => {
      const wasOpen = previousOpenRef.current;
      previousOpenRef.current = open;

      if (open) {
        exitedRef.current = false;
        clearExitTimer();
        setIsPanelPresent(true);

        if (!wasOpen) {
          beginTransition();
          clearTransitionRaf();
          if (typeof window === "undefined") {
            setIsPanelEntered(true);
          } else {
            transitionRafRef.current = window.requestAnimationFrame(() => {
              transitionRafRef.current = null;
              setIsPanelEntered(true);
            });
          }
        }
        return;
      }

      clearTransitionRaf();
      if (!wasOpen || typeof window === "undefined") {
        setIsPanelEntered(false);
        setIsPanelPresent(false);
        return;
      }

      exitedRef.current = false;
      beginTransition();
      setIsPanelEntered(false);
      exitTimerRef.current = window.setTimeout(finalizeClose, DOCKED_SIDE_PANEL_TRANSITION_MS + 80);

      return () => {
        clearExitTimer();
        clearTransitionRaf();
      };
    }, [beginTransition, clearExitTimer, clearTransitionRaf, finalizeClose, open]);

    React.useEffect(
      () => () => {
        previousOpenRef.current = false;
        clearExitTimer();
        clearTransitionTimer();
        clearTransitionRaf();
        emitTransitionState(false);
      },
      [clearExitTimer, clearTransitionRaf, clearTransitionTimer, emitTransitionState],
    );

    const ownerState: VireoDockedSidePanelOwnerState = {
      open,
      width,
      minWidth,
      maxWidth,
      isResizing,
      isPanelPresent,
      isPanelEntered,
    };
    const classes = useUtilityClasses(ownerState, classesProp);
    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedSurfaceSlotProps = resolveSlotProps(slotProps.surface, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const {
      className: surfaceSlotClassName,
      onTransitionEnd: surfaceSlotOnTransitionEnd,
      sx: surfaceSlotSx,
      ...surfaceSlotOther
    } = resolvedSurfaceSlotProps;

    const rootSizingSx = {
      width: ownerState.isPanelPresent ? ownerState.width : 0,
      minWidth: ownerState.isPanelPresent ? ownerState.minWidth : 0,
      maxWidth: ownerState.maxWidth,
    };
    const surfaceSizingSx = {
      width: ownerState.width,
      minWidth: ownerState.minWidth,
      maxWidth: ownerState.maxWidth,
    };

    const handleTransitionEnd = React.useCallback<React.TransitionEventHandler<HTMLDivElement>>(
      event => {
        surfaceSlotOnTransitionEnd?.(event);
        if (
          event.defaultPrevented ||
          event.target !== event.currentTarget ||
          !["transform", "opacity"].includes(event.propertyName)
        ) {
          return;
        }
        if (open) endTransition();
        else finalizeClose();
      },
      [endTransition, finalizeClose, open, surfaceSlotOnTransitionEnd],
    );

    return (
      <VireoDockedSidePanelRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(rootSizingSx, mergeSx(sx, rootSlotSx))}
        aria-hidden={!isPanelPresent}
        inert={!isPanelPresent}
      >
        <VireoDockedSidePanelSurface
          {...surfaceSlotOther}
          as={slots.surface ?? "aside"}
          ownerState={ownerState}
          className={joinClassNames(classes.surface, surfaceSlotClassName)}
          onTransitionEnd={handleTransitionEnd}
          inert={!open}
          sx={mergeSx(surfaceSizingSx, surfaceSlotSx)}
        >
          {resizeHandle}
          {children}
        </VireoDockedSidePanelSurface>
      </VireoDockedSidePanelRoot>
    );
  },
);

VireoDockedSidePanel.displayName = VIREO_DOCKED_SIDE_PANEL_NAME;
