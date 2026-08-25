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
  const {
    closeOverlay,
    onExited: onOverlayExited,
    open: overlayOpen,
    openOverlay,
    render: renderMountedOverlay,
  } = useDelayedOverlayMount();
  const [state, setState] = React.useState<OverlayState<TMap>>({ mode: "none" });

  const open = React.useCallback(
    <K extends keyof TMap>(mode: K, payload: TMap[K]) => {
      setState({ mode, payload } as OverlayState<TMap>);
      openOverlay();
    },
    [openOverlay],
  );

  const close = React.useCallback(() => {
    closeOverlay();
  }, [closeOverlay]);

  const onExited = React.useCallback(() => {
    setState({ mode: "none" });
    onOverlayExited();
  }, [onOverlayExited]);

  const render = React.useCallback(
    () =>
      renderMountedOverlay((overlayProps: DelayedOverlayRenderProps) => {
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
    [onExited, renderMountedOverlay, renderers, state],
  );

  const overlay = React.useMemo(
    () => ({
      open: overlayOpen,
      render,
    }),
    [overlayOpen, render],
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
