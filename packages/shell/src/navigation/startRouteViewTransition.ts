import { flushSync } from "react-dom";

const DEFAULT_ROUTE_COMMIT_TIMEOUT_MS = 5_000;

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => { finished: Promise<void> };
};

export type RouteViewTransitionConfig<TDirection extends string> = {
  directionAttributeName: string;
  getDestinationIdentity: () => string;
  getDirectionToken: (direction: TDirection) => string;
  isReducedMotion: () => boolean;
  isRouteCommitted: (element: HTMLElement, destinationIdentity: string) => boolean;
  routeCommitAttributeName: string;
  routeCommitTimeoutMs?: number;
};

export type StartRouteViewTransition<TDirection extends string> = (
  navigate: () => void,
  direction: TDirection,
) => Promise<void>;

function getDocument(): ViewTransitionDocument | undefined {
  return typeof document === "undefined" ? undefined : (document as ViewTransitionDocument);
}

export function createRouteViewTransition<TDirection extends string>({
  directionAttributeName,
  getDestinationIdentity,
  getDirectionToken,
  isReducedMotion,
  isRouteCommitted,
  routeCommitAttributeName,
  routeCommitTimeoutMs = DEFAULT_ROUTE_COMMIT_TIMEOUT_MS,
}: RouteViewTransitionConfig<TDirection>): StartRouteViewTransition<TDirection> {
  function hasCommittedRoute(currentDocument: Document, destinationIdentity: string): boolean {
    return [...currentDocument.querySelectorAll<HTMLElement>(`[${routeCommitAttributeName}]`)].some(element =>
      isRouteCommitted(element, destinationIdentity),
    );
  }

  function waitForRouteCommit(currentDocument: Document, destinationIdentity: string): Promise<void> {
    if (hasCommittedRoute(currentDocument, destinationIdentity)) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        observer.disconnect();
        globalThis.clearTimeout(timeoutId);
        resolve();
      };
      const observer = new MutationObserver(() => {
        if (hasCommittedRoute(currentDocument, destinationIdentity)) finish();
      });
      const timeoutId = globalThis.setTimeout(finish, routeCommitTimeoutMs);

      observer.observe(currentDocument.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [routeCommitAttributeName],
      });
    });
  }

  return (navigate, direction) => {
    const currentDocument = getDocument();

    if (!currentDocument) {
      navigate();
      return Promise.resolve();
    }

    currentDocument.documentElement.setAttribute(directionAttributeName, getDirectionToken(direction));
    const clearDirection = () => currentDocument.documentElement.removeAttribute(directionAttributeName);
    const startViewTransition = currentDocument.startViewTransition;

    if (!startViewTransition || isReducedMotion()) {
      try {
        navigate();
        return Promise.resolve();
      } finally {
        clearDirection();
      }
    }

    try {
      const transition = startViewTransition.call(currentDocument, async () => {
        flushSync(navigate);

        // A lazy route or Suspense boundary may retain the previous page after
        // the location changes. Wait for the destination layout to commit so
        // the View Transition captures the intended destination snapshot.
        await waitForRouteCommit(currentDocument, getDestinationIdentity());
      });

      return transition.finished.finally(clearDirection);
    } catch (error) {
      clearDirection();
      throw error;
    }
  };
}
