import type { VireoPageLayoutMode } from "@/capabilities/page-layout/types/pageLayout.types";
import { resolveVireoPageLayoutMode } from "@/capabilities/page-layout/utils/pageLayout.utils";
import React from "react";

export type UseMeasuredVireoPageLayoutOptions = {
  /** Controls the layout mode without measuring a container. */
  mode?: VireoPageLayoutMode;
  /** Resolves compact mode without measuring a container. @default false */
  forceCompact?: boolean;
  /** Measures the referenced element's parent instead of the element itself. @default false */
  measureParent?: boolean;
  /** Suspends measurement while preserving the last resolved mode. @default false */
  paused?: boolean;
  /** Inline space to subtract from the measured container width. @default 0 */
  reservedInlineSize?: number;
};

/**
 * Resolves page layout from an element container after mount.
 *
 * Uncontrolled rendering starts in `regular` mode on both the server and the
 * hydrating client, then synchronizes to the measured container before paint.
 */
export function useMeasuredVireoPageLayout<E extends HTMLElement = HTMLDivElement>({
  mode,
  forceCompact = false,
  measureParent = false,
  paused = false,
  reservedInlineSize = 0,
}: UseMeasuredVireoPageLayoutOptions = {}) {
  const [measuredMode, setMeasuredMode] = React.useState<VireoPageLayoutMode>(
    () => mode ?? (forceCompact ? "compact" : "regular"),
  );
  const modeRef = React.useRef(measuredMode);
  const ref = React.useRef<E>(null);
  const normalizedReservedInlineSize =
    Number.isFinite(reservedInlineSize) && reservedInlineSize > 0 ? reservedInlineSize : 0;

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
      const measuredInlineSize = Math.max(
        0,
        Math.round(target.getBoundingClientRect().width - normalizedReservedInlineSize),
      );
      const next = resolveVireoPageLayoutMode(measuredInlineSize, modeRef.current);
      if (next !== modeRef.current) {
        modeRef.current = next;
        setMeasuredMode(next);
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
  }, [forceCompact, measureParent, mode, normalizedReservedInlineSize, paused]);

  return { ref, mode: mode ?? (forceCompact ? "compact" : measuredMode) };
}
