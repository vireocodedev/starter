import { useUnsavedChanges } from "@/capabilities/unsaved-changes/public";
import React from "react";

export type GuardedOverlayModeSwitch<TPayloadByMode extends Record<string, unknown>> = <
  TMode extends keyof TPayloadByMode,
>(
  mode: TMode,
  payload: TPayloadByMode[TMode],
  beforeOpen?: () => void,
) => void;

export function useGuardedOverlayModeSwitch<TPayloadByMode extends Record<string, unknown>>(
  overlayOpen: boolean,
  openMode: (mode: keyof TPayloadByMode, payload: TPayloadByMode[keyof TPayloadByMode]) => void,
): GuardedOverlayModeSwitch<TPayloadByMode> {
  const { requestDiscard } = useUnsavedChanges();
  const openModeRef = React.useRef(openMode);
  const overlayOpenRef = React.useRef(overlayOpen);
  const requestDiscardRef = React.useRef(requestDiscard);

  openModeRef.current = openMode;
  overlayOpenRef.current = overlayOpen;
  requestDiscardRef.current = requestDiscard;

  return React.useCallback(
    ((mode, payload, beforeOpen) => {
      const commitOpen = () => {
        beforeOpen?.();
        openModeRef.current(mode, payload);
      };

      if (!overlayOpenRef.current) {
        commitOpen();
        return;
      }

      requestDiscardRef.current({ onDiscard: commitOpen });
    }) as GuardedOverlayModeSwitch<TPayloadByMode>,
    [],
  );
}
