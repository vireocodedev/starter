import { readOverlayStack, resolveOverlayHistoryAction, withOverlayStack } from "./overlayHistory.machine";
import { type OverlayHistoryEntryId } from "./overlayHistory.types";
import { getOverlayHistoryEntriesSnapshot, subscribeToOverlayHistoryEntries } from "./overlayHistory.store";
import React from "react";
import { useLocation, useNavigate, useNavigationType, type Location } from "react-router";

/**
 * Upper bound on consecutive repair operations for a single URL. Purely a
 * runaway guard: a healthy stack converges in at most one operation per layer.
 */
const MAX_CONSECUTIVE_OPERATIONS = 16;

function getLocationIdentity(location: Location): string {
  return `${location.pathname}${location.search}${location.hash}`;
}

/**
 * Keeps browser history in sync with the open overlay layers registered through
 * {@link useOverlayBackClose}.
 *
 * Why same-URL router pushes instead of `useBlocker` or raw `history.pushState`:
 *
 * - `useBlocker` supports a single blocker per data router and one may already
 *   be owned by an unsaved-changes provider. It cannot express "close a layer
 *   without moving", and resetting a blocked POP leaves the router's history
 *   index desynchronised.
 * - Raw `history.pushState` bypasses the bookkeeping (`idx`) that react-router's
 *   browser history keeps in `window.history.state`, which corrupts subsequent
 *   POP delta calculations in a data router.
 *
 * Navigating to the current URL with extra location state is the idiomatic data
 * router equivalent: the router owns the entry, no loaders exist on these routes
 * so the push is inert, and the URL never changes — so a back press pops the
 * synthetic entry and the route underneath stays put.
 */
export function OverlayHistoryBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const entries = React.useSyncExternalStore(subscribeToOverlayHistoryEntries, getOverlayHistoryEntriesSnapshot);

  const [reconcileTick, setReconcileTick] = React.useState(0);
  const locationKeyRef = React.useRef(location.key);
  const urlIdentityRef = React.useRef(getLocationIdentity(location));
  const previousStackRef = React.useRef<OverlayHistoryEntryId[]>(readOverlayStack(location.state));
  const ownedIdsRef = React.useRef<Set<OverlayHistoryEntryId>>(new Set());
  const operationCountRef = React.useRef(0);

  React.useEffect(() => {
    const desired = entries.map(entry => entry.id);
    const rawStack = readOverlayStack(location.state);
    const urlIdentity = getLocationIdentity(location);
    const locationChanged = locationKeyRef.current !== location.key;
    const urlChanged = urlIdentityRef.current !== urlIdentity;
    const previousStack = previousStackRef.current;

    if (locationChanged) {
      locationKeyRef.current = location.key;
      urlIdentityRef.current = urlIdentity;
      previousStackRef.current = rawStack;
    }

    if (urlChanged) {
      operationCountRef.current = 0;
    }

    // Entries restored by a reload or produced before this bridge mounted are
    // not backed by a push we made, so they must never be consumed with
    // `navigate(-1)` (that could walk out of the app). Strip them in place.
    const unownedIds = rawStack.filter(id => !ownedIdsRef.current.has(id));

    if (unownedIds.length > 0) {
      const ownedStack = rawStack.filter(id => ownedIdsRef.current.has(id));
      previousStackRef.current = ownedStack;
      void navigate(urlIdentity, {
        replace: true,
        preventScrollReset: true,
        state: withOverlayStack(location.state, ownedStack),
      });
      return;
    }

    const action = resolveOverlayHistoryAction({
      desired,
      actual: rawStack,
      previousActual: previousStack,
      navigationType,
      locationChanged,
      urlChanged,
    });

    if (action.type === "idle") {
      operationCountRef.current = 0;
      return;
    }

    if (action.type === "requestClose") {
      const entry = entries.find(candidate => candidate.id === action.id);
      entry?.requestClose();
      // Re-run with a fresh registry snapshot: if the overlay refused to close
      // (unsaved-changes guard), the next pass re-pushes its entry so the stack
      // stays consistent and a second back press works.
      setReconcileTick(tick => tick + 1);
      return;
    }

    operationCountRef.current += 1;

    if (operationCountRef.current > MAX_CONSECUTIVE_OPERATIONS) {
      return;
    }

    if (action.type === "consume") {
      previousStackRef.current = rawStack.slice(0, -1);
      void navigate(-1);
      return;
    }

    action.stack.forEach(id => ownedIdsRef.current.add(id));
    previousStackRef.current = [...action.stack];
    void navigate(urlIdentity, {
      preventScrollReset: true,
      state: withOverlayStack(location.state, action.stack),
    });
  }, [entries, location, navigate, navigationType, reconcileTick]);

  return null;
}
