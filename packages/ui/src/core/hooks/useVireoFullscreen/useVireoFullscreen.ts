import React from "react";
import type { VireoFullscreen } from "./useVireoFullscreen.types";

export type { VireoFullscreen } from "./useVireoFullscreen.types";

const EMPTY_SUBSCRIBE = () => () => undefined;
const GET_EMPTY_SNAPSHOT = () => null;

type SupportedFullscreenTarget = {
  target: Element;
  ownerDocument: Document;
};

function resolveSupportedTarget(target: Element | null): SupportedFullscreenTarget {
  if (target === null) {
    throw new Error("useVireoFullscreen requires a target element.");
  }

  const ownerDocument = target.ownerDocument;
  if (
    ownerDocument.fullscreenEnabled !== true ||
    typeof target.requestFullscreen !== "function" ||
    typeof ownerDocument.exitFullscreen !== "function"
  ) {
    throw new Error("The Fullscreen API is not supported for the useVireoFullscreen target.");
  }

  return { target, ownerDocument };
}

/**
 * Observes and controls the standard Fullscreen API for one target element.
 */
export function useVireoFullscreen(target: Element | null): VireoFullscreen {
  const targetRef = React.useRef(target);
  targetRef.current = target;

  const ownerDocument = target?.ownerDocument ?? null;
  const subscribe = React.useCallback(
    (listener: () => void) => {
      if (ownerDocument === null) return EMPTY_SUBSCRIBE();
      ownerDocument.addEventListener("fullscreenchange", listener);
      return () => ownerDocument.removeEventListener("fullscreenchange", listener);
    },
    [ownerDocument],
  );
  const getSnapshot = React.useCallback(() => ownerDocument?.fullscreenElement ?? null, [ownerDocument]);
  const fullscreenElement = React.useSyncExternalStore(subscribe, getSnapshot, GET_EMPTY_SNAPSHOT);
  const isSupported =
    target !== null &&
    ownerDocument?.fullscreenEnabled === true &&
    typeof target.requestFullscreen === "function" &&
    typeof ownerDocument.exitFullscreen === "function";

  const enterFullscreen = React.useCallback(async (options?: FullscreenOptions) => {
    const { target: currentTarget, ownerDocument: currentDocument } = resolveSupportedTarget(targetRef.current);
    if (currentDocument.fullscreenElement === currentTarget) return;
    await currentTarget.requestFullscreen(options);
  }, []);

  const exitFullscreen = React.useCallback(async () => {
    const { target: currentTarget, ownerDocument: currentDocument } = resolveSupportedTarget(targetRef.current);
    if (currentDocument.fullscreenElement !== currentTarget) return;
    await currentDocument.exitFullscreen();
  }, []);

  const toggleFullscreen = React.useCallback(async (options?: FullscreenOptions) => {
    const { target: currentTarget, ownerDocument: currentDocument } = resolveSupportedTarget(targetRef.current);
    if (currentDocument.fullscreenElement === currentTarget) {
      await currentDocument.exitFullscreen();
      return;
    }
    await currentTarget.requestFullscreen(options);
  }, []);

  return {
    isSupported,
    isFullscreen: fullscreenElement === target && target !== null,
    fullscreenElement,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
