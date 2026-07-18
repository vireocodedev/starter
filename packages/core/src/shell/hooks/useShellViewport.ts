import { NAV_DEFAULT_EXPANDED_WIDTH } from "@/shell/layout/layoutNav.constants";
import { APP_PAGE_CONTENT_MIN_WIDTH } from "@/shell/layout/shell.constants";
import React from "react";

export function useShellViewportWidth(): number {
  const [viewportWidth, setViewportWidth] = React.useState(() =>
    typeof window === "undefined" ? APP_PAGE_CONTENT_MIN_WIDTH + NAV_DEFAULT_EXPANDED_WIDTH : window.innerWidth,
  );
  const viewportResizeRafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onResize = () => {
      if (viewportResizeRafRef.current !== null) {
        return;
      }

      viewportResizeRafRef.current = window.requestAnimationFrame(() => {
        viewportResizeRafRef.current = null;
        setViewportWidth(previousWidth => {
          const nextWidth = window.innerWidth;

          return previousWidth === nextWidth ? previousWidth : nextWidth;
        });
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);

      if (viewportResizeRafRef.current !== null) {
        window.cancelAnimationFrame(viewportResizeRafRef.current);
        viewportResizeRafRef.current = null;
      }
    };
  }, []);

  return viewportWidth;
}
