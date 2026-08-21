import type { VireoPageLayoutMode } from "@/capabilities/page-layout/types/pageLayout.types";
import { resolveVireoPageLayoutMode } from "@/capabilities/page-layout/utils/pageLayout.utils";
import React from "react";

export type UseMeasuredVireoPageLayoutOptions = {
  mode?: VireoPageLayoutMode;
  forceCompact?: boolean;
  measureParent?: boolean;
  paused?: boolean;
  reservedInlineSize?: number;
};

export function useMeasuredVireoPageLayout<E extends HTMLElement = HTMLDivElement>({
  mode,
  forceCompact = false,
  measureParent = false,
  paused = false,
  reservedInlineSize = 0,
}: UseMeasuredVireoPageLayoutOptions = {}) {
  const initialWidth = typeof window === "undefined" ? 0 : Math.max(0, window.innerWidth - reservedInlineSize);
  const [measuredMode, setMeasuredMode] = React.useState<VireoPageLayoutMode>(
    () => mode ?? (forceCompact ? "compact" : resolveVireoPageLayoutMode(initialWidth)),
  );
  const modeRef = React.useRef(measuredMode);
  const ref = React.useRef<E>(null);

  React.useLayoutEffect(() => {
    if (mode) {
      modeRef.current = mode;
      setMeasuredMode(mode);
      return;
    }
    if (forceCompact) {
      modeRef.current = "compact";
      setMeasuredMode("compact");
      return;
    }
    if (paused) return;
    const element = ref.current;
    if (!element) return;
    const target = measureParent ? (element.parentElement ?? element) : element;
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const next = resolveVireoPageLayoutMode(Math.round(target.getBoundingClientRect().width), modeRef.current);
      if (next !== modeRef.current) {
        modeRef.current = next;
        React.startTransition(() => setMeasuredMode(next));
      }
    };
    const schedule = () => {
      if (frame == null) frame = window.requestAnimationFrame(measure);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", schedule);
      return () => {
        window.removeEventListener("resize", schedule);
        if (frame != null) window.cancelAnimationFrame(frame);
      };
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(target);
    return () => {
      observer.disconnect();
      if (frame != null) window.cancelAnimationFrame(frame);
    };
  }, [forceCompact, measureParent, mode, paused]);

  return { ref, mode: mode ?? (forceCompact ? "compact" : measuredMode) };
}
