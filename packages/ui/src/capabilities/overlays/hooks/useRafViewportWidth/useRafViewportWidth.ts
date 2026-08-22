import React from "react";

/** Tracks viewport width at most once per animation frame while enabled. */
export function useRafViewportWidth(enabled: boolean): number {
  const [viewportWidth, setViewportWidth] = React.useState(() =>
    typeof window === "undefined" ? 0 : window.innerWidth,
  );
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const onResize = () => {
      if (rafRef.current !== null) {
        return;
      }

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        setViewportWidth(previousWidth => {
          const nextWidth = window.innerWidth;

          return previousWidth === nextWidth ? previousWidth : nextWidth;
        });
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled]);

  return viewportWidth;
}
