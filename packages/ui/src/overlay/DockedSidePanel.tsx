import {
  DOCKED_SIDE_PANEL_TRANSITION_EVENT,
  DOCKED_SIDE_PANEL_TRANSITION_MS,
  type DockedSidePanelTransitionEventDetail,
} from "./overlay.constants";
import { type ResponsiveOverlayFrameDesktopSidePanelWidth } from "./overlay.types";
import { Box, type SxProps, type Theme } from "@mui/material";
import { mergeSx } from "@/utils/muiutils";
import React from "react";

export function DockedSidePanel({
  open,
  width,
  minWidth,
  maxWidth,
  isResizing = false,
  rootRef,
  style,
  sx,
  resizeHandle,
  onExited,
  children,
}: {
  open: boolean;
  width: ResponsiveOverlayFrameDesktopSidePanelWidth;
  minWidth: number;
  maxWidth: number;
  isResizing?: boolean;
  rootRef?: (element: HTMLDivElement | null) => void;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
  resizeHandle?: React.ReactNode;
  onExited?: () => void;
  children: React.ReactNode;
}) {
  const [isPanelPresent, setIsPanelPresent] = React.useState(open);
  const [isPanelEntered, setIsPanelEntered] = React.useState(open);
  const previousOpenRef = React.useRef(open);
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
    if (exitTimerRef.current === null || typeof window === "undefined") {
      return;
    }

    window.clearTimeout(exitTimerRef.current);
    exitTimerRef.current = null;
  }, []);

  const clearTransitionTimer = React.useCallback(() => {
    if (transitionTimerRef.current === null || typeof window === "undefined") {
      return;
    }

    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
  }, []);

  const clearTransitionRaf = React.useCallback(() => {
    if (transitionRafRef.current === null || typeof window === "undefined") {
      return;
    }

    window.cancelAnimationFrame(transitionRafRef.current);
    transitionRafRef.current = null;
  }, []);

  const emitTransitionState = React.useCallback((animating: boolean) => {
    if (typeof window === "undefined") {
      return;
    }

    if (animating === isTransitioningRef.current) {
      return;
    }

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
    if (typeof window === "undefined") {
      return;
    }

    clearTransitionTimer();
    emitTransitionState(true);
    transitionTimerRef.current = window.setTimeout(endTransition, DOCKED_SIDE_PANEL_TRANSITION_MS + 80);
  }, [clearTransitionTimer, emitTransitionState, endTransition]);

  const emitExited = React.useCallback(() => {
    if (exitedRef.current) {
      return;
    }

    exitedRef.current = true;
    clearExitTimer();
    onExitedRef.current?.();
  }, [clearExitTimer]);

  const finalizeClose = React.useCallback(() => {
    if (open) {
      return;
    }

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

  React.useEffect(() => {
    return () => {
      clearExitTimer();
      clearTransitionTimer();
      clearTransitionRaf();
      emitTransitionState(false);
    };
  }, [clearExitTimer, clearTransitionRaf, clearTransitionTimer, emitTransitionState]);

  const handleTransitionEnd = React.useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || !["transform", "opacity"].includes(event.propertyName)) {
        return;
      }

      if (open) {
        endTransition();
        return;
      }

      finalizeClose();
    },
    [endTransition, finalizeClose, open],
  );

  return (
    <Box
      ref={rootRef}
      aria-hidden={!isPanelPresent}
      style={style}
      sx={{
        flex: "0 0 auto",
        width: isPanelPresent ? width : 0,
        minWidth: isPanelPresent ? minWidth : 0,
        maxWidth,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        pointerEvents: open ? "auto" : "none",
        contain: "layout paint",
      }}
    >
      <Box
        onTransitionEnd={handleTransitionEnd}
        sx={mergeSx(
          theme => ({
            position: "relative",
            width,
            minWidth,
            maxWidth,
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: "background.paper",
            borderLeft: `1px solid ${theme.palette.grey[300]}`,
            transform: isPanelEntered ? "translateX(0)" : "translateX(24px)",
            opacity: isPanelEntered ? 1 : 0,
            transition: isResizing
              ? "none"
              : theme.transitions.create(["transform", "opacity"], {
                  duration: DOCKED_SIDE_PANEL_TRANSITION_MS,
                  easing: theme.transitions.easing.easeInOut,
                }),
            willChange: isResizing ? "auto" : "transform, opacity",
            backfaceVisibility: "hidden",
          }),
          sx,
        )}
      >
        {resizeHandle}
        {children}
      </Box>
    </Box>
  );
}
