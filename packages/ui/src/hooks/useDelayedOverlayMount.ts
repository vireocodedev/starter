import React from "react";

export type DelayedOverlayRenderProps = {
  open: boolean;
  onClose: () => void;
  onExited: () => void;
};

export type UseDelayedOverlayMountReturn = {
  mounted: boolean;
  open: boolean;
  openOverlay: () => void;
  closeOverlay: () => void;
  onExited: () => void;
  render: (children: (props: DelayedOverlayRenderProps) => React.ReactNode) => React.ReactNode;
};

export function useDelayedOverlayMount(): UseDelayedOverlayMountReturn {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const openRef = React.useRef(open);
  const animationFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const openOverlay = React.useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setMounted(true);
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      openRef.current = true;
      setOpen(true);
    });
  }, []);

  const closeOverlay = React.useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      setMounted(false);
    }

    openRef.current = false;
    setOpen(false);
  }, []);

  const onExited = React.useCallback(() => {
    if (!openRef.current) {
      setMounted(false);
    }
  }, []);

  const render = React.useCallback(
    (children: (props: DelayedOverlayRenderProps) => React.ReactNode) => {
      if (!mounted) {
        return null;
      }

      return children({
        open,
        onClose: closeOverlay,
        onExited,
      });
    },
    [closeOverlay, mounted, onExited, open],
  );

  return React.useMemo(
    () => ({
      mounted,
      open,
      openOverlay,
      closeOverlay,
      onExited,
      render,
    }),
    [mounted, open, openOverlay, closeOverlay, onExited, render],
  );
}
