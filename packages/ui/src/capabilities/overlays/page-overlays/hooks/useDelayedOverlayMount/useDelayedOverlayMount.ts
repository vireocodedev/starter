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

  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  const openOverlay = React.useCallback(() => {
    openRef.current = true;
    setMounted(true);
    setOpen(true);
  }, []);

  const closeOverlay = React.useCallback(() => {
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
