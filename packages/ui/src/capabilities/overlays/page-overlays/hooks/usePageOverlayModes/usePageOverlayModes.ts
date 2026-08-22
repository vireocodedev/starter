import {
  useDelayedOverlayMount,
  type DelayedOverlayRenderProps,
} from "@/capabilities/overlays/page-overlays/hooks/useDelayedOverlayMount/useDelayedOverlayMount";
import React from "react";

export type OverlayPayloadMap = Record<string, unknown>;

export type OverlayState<TMap extends OverlayPayloadMap> =
  | { mode: "none" }
  | {
      [K in keyof TMap]: {
        mode: K;
        payload: TMap[K];
      };
    }[keyof TMap];

export type OverlayRendererProps = DelayedOverlayRenderProps & {
  onExited: () => void;
};

export type OverlayRenderers<TMap extends OverlayPayloadMap> = {
  [K in keyof TMap]: (props: OverlayRendererProps, payload: TMap[K]) => React.ReactElement | null;
};

export type UsePageOverlayModesReturn<TMap extends OverlayPayloadMap> = {
  overlay: {
    open: boolean;
    render: () => React.ReactNode;
  };
  state: OverlayState<TMap>;
  open: <K extends keyof TMap>(mode: K, payload: TMap[K]) => void;
  close: () => void;
  onExited: () => void;
};

export function usePageOverlayModes<TMap extends OverlayPayloadMap>(
  renderers: OverlayRenderers<TMap>,
): UsePageOverlayModesReturn<TMap> {
  const delayedOverlay = useDelayedOverlayMount();
  const [state, setState] = React.useState<OverlayState<TMap>>({ mode: "none" });

  const open = React.useCallback(
    <K extends keyof TMap>(mode: K, payload: TMap[K]) => {
      setState({ mode, payload } as OverlayState<TMap>);
      delayedOverlay.openOverlay();
    },
    [delayedOverlay],
  );

  const close = React.useCallback(() => {
    delayedOverlay.closeOverlay();
  }, [delayedOverlay]);

  const onExited = React.useCallback(() => {
    setState({ mode: "none" });
    delayedOverlay.onExited();
  }, [delayedOverlay]);

  const render = React.useCallback(
    () =>
      delayedOverlay.render((overlayProps: DelayedOverlayRenderProps) => {
        if (!("payload" in state)) {
          return null;
        }

        const mode = state.mode as keyof TMap;
        const renderer = renderers[mode] as (
          props: OverlayRendererProps,
          payload: TMap[keyof TMap],
        ) => React.ReactElement | null;

        return renderer(
          {
            ...overlayProps,
            onExited,
          },
          state.payload as TMap[keyof TMap],
        );
      }),
    [delayedOverlay, onExited, renderers, state],
  );

  const overlay = React.useMemo(
    () => ({
      open: delayedOverlay.open,
      render,
    }),
    [delayedOverlay.open, render],
  );

  return React.useMemo(
    () => ({
      overlay,
      state,
      open,
      close,
      onExited,
    }),
    [overlay, state, open, close, onExited],
  );
}
