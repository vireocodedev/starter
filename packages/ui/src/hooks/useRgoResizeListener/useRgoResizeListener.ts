import React from "react";

export function useRgoResizeListener(listener: () => void): void {
  React.useEffect(() => {
    function onResize() {
      listener();
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [listener]);
}
