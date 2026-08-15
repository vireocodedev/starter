import { resolveAppPageContentMode, type AppPageContentMode } from "@/layout/AppPageContentLayout.utils";
import React from "react";

export type UseMeasuredPageContentModeOptions = {
  /** Forces compact content when the surrounding navigation/layout uses its compact paradigm. */
  forceCompact?: boolean;
  /** Horizontal space reserved outside the content when falling back to viewport width. */
  reservedInlineSize?: number;
  /**
   * Measure the ref element's *parent* outer width instead of the element's own width. Some
   * containers apply padding that changes with content mode (compact = 0, regular = 24px * 2),
   * which would otherwise cause the inner element's measured width to drop on switch — creating
   * an oscillation loop around the enter/exit thresholds.
   */
  measureParent?: boolean;
  /** Skip measuring/updating while true (e.g. mid docked side-panel transition). */
  paused?: boolean;
};

export type UseMeasuredPageContentModeResult<E extends HTMLElement> = {
  ref: React.RefObject<E>;
  contentMode: AppPageContentMode;
};

function measureWidth(element: HTMLElement, measureParent: boolean | undefined): number {
  const target = measureParent ? (element.parentElement ?? element) : element;
  return Math.round(target.getBoundingClientRect().width);
}

function resolveInitialWidth(forceCompact: boolean, reservedInlineSize: number): number {
  if (typeof window === "undefined") {
    return 0;
  }

  // Compact surroundings consume no horizontal space; a regular side surface is a layout sibling
  // that shrinks the content area, so callers supply its reserved width explicitly.
  return forceCompact ? window.innerWidth : Math.max(0, window.innerWidth - reservedInlineSize);
}

/**
 * Resolves content layout from a measured width and an optional surrounding compact-mode policy.
 * The force flag lets a shell keep navigation and page content in the same layout paradigm without
 * coupling this hook to a particular navigation implementation.
 */
export function resolveMeasuredPageContentMode(
  width: number,
  forceCompact: boolean,
  previousMode?: AppPageContentMode,
): AppPageContentMode {
  if (forceCompact) {
    return "compact";
  }

  return resolveAppPageContentMode(width, previousMode);
}

/**
 * Measures an element's rendered width (via ResizeObserver, falling back to window resize events)
 * and resolves the page content layout mode from it. Shell-specific layout state and reserved
 * widths are supplied through options so the measurement logic remains portable.
 */
export function useMeasuredPageContentMode<E extends HTMLElement = HTMLDivElement>(
  options: UseMeasuredPageContentModeOptions = {},
): UseMeasuredPageContentModeResult<E> {
  const { forceCompact = false, measureParent, paused = false, reservedInlineSize = 0 } = options;

  const [contentMode, setContentMode] = React.useState<AppPageContentMode>(() =>
    resolveMeasuredPageContentMode(resolveInitialWidth(forceCompact, reservedInlineSize), forceCompact),
  );
  const contentModeRef = React.useRef(contentMode);
  const ref = React.useRef<E>(null);
  const rafRef = React.useRef<number | null>(null);

  const updateContentMode = React.useCallback(
    (width: number, immediate = false) => {
      const nextMode = resolveMeasuredPageContentMode(width, forceCompact, contentModeRef.current);

      if (nextMode === contentModeRef.current) {
        return;
      }

      contentModeRef.current = nextMode;

      if (immediate) {
        setContentMode(nextMode);
        return;
      }

      React.startTransition(() => {
        setContentMode(nextMode);
      });
    },
    [forceCompact],
  );

  // The first measurement must happen before paint so page content never flashes in a mode
  // estimated from viewport width. Observer updates remain transitions because they happen
  // after the initial frame and may coincide with shell or docked-panel animation.
  React.useLayoutEffect(() => {
    if (paused) {
      return;
    }

    const element = ref.current;

    if (!element) {
      updateContentMode(resolveInitialWidth(forceCompact, reservedInlineSize), true);
      return;
    }

    const measure = (immediate = false) => updateContentMode(measureWidth(element, measureParent), immediate);

    const scheduleMeasure = () => {
      if (rafRef.current !== null) {
        return;
      }

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        measure();
      });
    };

    measure(true);

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", scheduleMeasure);

      return () => {
        window.removeEventListener("resize", scheduleMeasure);

        if (rafRef.current !== null) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(element);

    return () => {
      observer.disconnect();

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [forceCompact, measureParent, paused, reservedInlineSize, updateContentMode]);

  return { ref, contentMode };
}
