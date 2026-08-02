import React from "react";

export function useRgoFullscreenListener(listener: () => void): void {
  React.useEffect(() => {
    function onFullscreenChange() {
      listener();
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [listener]);
}
