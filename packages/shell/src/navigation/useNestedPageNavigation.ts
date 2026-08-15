import React from "react";
import { useLocation, useNavigate, type NavigateOptions } from "react-router";

export type NestedPageTransitionDirection = "back" | "forward";

export type NestedPageTransitionAdapter = (
  navigation: () => void,
  direction: NestedPageTransitionDirection,
) => Promise<void>;

export type NestedPageBackOptions = {
  runNavigation?: (navigation: () => void) => void;
};

export type UseNestedPageNavigationOptions = {
  fallbackParentPath?: string;
  stateKey: string;
  startViewTransition: NestedPageTransitionAdapter;
};

type NestedPageState = {
  parentPath: string;
  parentState?: unknown;
};

function getLocationIdentity(location: { pathname: string; search: string; hash: string }): string {
  return `${location.pathname}${location.search}${location.hash}`;
}

function readParentLocation(state: unknown, stateKey: string): NestedPageState | null {
  if (typeof state !== "object" || state === null) return null;

  const nestedPageState = (state as Record<string, unknown>)[stateKey];
  if (typeof nestedPageState !== "object" || nestedPageState === null) return null;

  const parentLocation = nestedPageState as Partial<NestedPageState>;
  return typeof parentLocation.parentPath === "string"
    ? { parentPath: parentLocation.parentPath, parentState: parentLocation.parentState }
    : null;
}

export function useNestedPageNavigation({
  fallbackParentPath,
  stateKey,
  startViewTransition,
}: UseNestedPageNavigationOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = getLocationIdentity(location);
  const recordedParent = readParentLocation(location.state, stateKey);
  const parentPath = recordedParent?.parentPath ?? fallbackParentPath ?? null;

  const navigateForward = React.useCallback(
    (path: string, options: NavigateOptions = {}) => {
      const state = typeof options.state === "object" && options.state !== null ? options.state : {};

      return startViewTransition(
        () =>
          navigate(path, {
            ...options,
            state: {
              ...state,
              [stateKey]: { parentPath: currentPath, parentState: location.state },
            },
          }),
        "forward",
      );
    },
    [currentPath, location.state, navigate, startViewTransition, stateKey],
  );

  const navigateBack = React.useCallback(
    ({ runNavigation = navigation => navigation() }: NestedPageBackOptions = {}) => {
      if (!parentPath) return Promise.resolve();

      return startViewTransition(
        () =>
          runNavigation(() =>
            navigate(parentPath, {
              replace: true,
              state: recordedParent?.parentState,
            }),
          ),
        "back",
      );
    },
    [navigate, parentPath, recordedParent?.parentState, startViewTransition],
  );

  return { navigateBack, navigateForward, parentPath };
}
