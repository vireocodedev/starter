import { useUnsavedChanges } from "@/unsaved-changes/UnsavedChangesContext";
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

  return React.useMemo(
    () =>
      ((mode, payload, beforeOpen) => {
        const commitOpen = () => {
          beforeOpen?.();
          openMode(mode, payload);
        };

        if (!overlayOpen) {
          commitOpen();
          return;
        }

        requestDiscard({ onDiscard: commitOpen });
      }) as GuardedOverlayModeSwitch<TPayloadByMode>,
    [openMode, overlayOpen, requestDiscard],
  );
}
