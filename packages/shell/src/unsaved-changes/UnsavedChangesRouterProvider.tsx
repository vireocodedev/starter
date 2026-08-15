import {
  createUnsavedChangesRegistry,
  getUnsavedChangesStatus,
  UnsavedChangesContext,
  type UnsavedChangesDiscardRequest,
} from "@vireocodedev/starter-ui";
import React from "react";
import { useBeforeUnload, useBlocker, type BlockerFunction } from "react-router";

export type UnsavedChangesNavigationLocation = {
  hash: string;
  pathname: string;
  search: string;
};

export type UnsavedChangesNavigationContext = {
  currentLocation: UnsavedChangesNavigationLocation;
  nextLocation: UnsavedChangesNavigationLocation;
};

export type UnsavedChangesPromptRenderProps = {
  busy: boolean;
  discarding: boolean;
  onDiscard: () => void;
  onStay: () => void;
  open: boolean;
};

export type UnsavedChangesRouterProviderProps = {
  children: React.ReactNode;
  renderPrompt: (props: UnsavedChangesPromptRenderProps) => React.ReactNode;
  shouldBypassNavigation?: (context: UnsavedChangesNavigationContext) => boolean;
};

function getLocationIdentity(location: UnsavedChangesNavigationLocation): string {
  return `${location.pathname}${location.search}${location.hash}`;
}

function BeforeUnloadGuard() {
  useBeforeUnload(
    React.useCallback(event => {
      event.preventDefault();
      event.returnValue = "";
    }, []),
  );

  return null;
}

export function UnsavedChangesRouterProvider({
  children,
  renderPrompt,
  shouldBypassNavigation,
}: UnsavedChangesRouterProviderProps) {
  const [registry] = React.useState(createUnsavedChangesRegistry);
  const registrations = React.useSyncExternalStore(registry.subscribe, registry.getSnapshot, registry.getSnapshot);
  const [discardRequest, setDiscardRequest] = React.useState<UnsavedChangesDiscardRequest | null>(null);
  const [discarding, setDiscarding] = React.useState(false);
  const globalStatus = React.useMemo(() => getUnsavedChangesStatus(registrations, null), [registrations]);

  const shouldBlockNavigation = React.useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) => {
      if (
        registry.isNavigationBlockBypassed() ||
        shouldBypassNavigation?.({ currentLocation, nextLocation }) === true
      ) {
        return false;
      }

      return globalStatus.dirty && getLocationIdentity(currentLocation) !== getLocationIdentity(nextLocation);
    },
    [globalStatus.dirty, registry, shouldBypassNavigation],
  );
  const blocker = useBlocker(shouldBlockNavigation);

  const requestDiscard = React.useCallback(
    (request: UnsavedChangesDiscardRequest) => {
      if (!registry.getStatus(request.scopeId ?? null).dirty) {
        void request.onDiscard();
        return;
      }

      setDiscardRequest(current => current ?? request);
    },
    [registry],
  );

  const discardStatus = discardRequest
    ? getUnsavedChangesStatus(registrations, discardRequest.scopeId ?? null)
    : globalStatus;
  const promptOpen = blocker.state === "blocked" || discardRequest != null;
  const promptBusy = discardStatus.busy;

  React.useEffect(() => {
    if (blocker.state === "blocked" && !globalStatus.dirty) {
      blocker.proceed();
    }
  }, [blocker, globalStatus.dirty]);

  React.useEffect(() => {
    if (!discardRequest || discardStatus.dirty) {
      return;
    }

    setDiscardRequest(null);
    void discardRequest.onDiscard();
  }, [discardRequest, discardStatus.dirty]);

  const handleStay = React.useCallback(() => {
    if (discarding) {
      return;
    }

    if (blocker.state === "blocked") {
      blocker.reset();
      return;
    }

    setDiscardRequest(null);
  }, [blocker, discarding]);

  const handleDiscard = React.useCallback(async () => {
    if (discarding || promptBusy) {
      return;
    }

    if (blocker.state === "blocked") {
      blocker.proceed();
      return;
    }

    const request = discardRequest;
    if (!request) {
      return;
    }

    setDiscarding(true);
    setDiscardRequest(null);

    try {
      await request.onDiscard();
    } finally {
      setDiscarding(false);
    }
  }, [blocker, discardRequest, discarding, promptBusy]);

  const contextValue = React.useMemo(
    () => ({
      removeRegistration: registry.removeRegistration,
      requestDiscard,
      runWithoutNavigationBlock: registry.runWithoutNavigationBlock,
      upsertRegistration: registry.upsertRegistration,
    }),
    [registry, requestDiscard],
  );

  return (
    <UnsavedChangesContext.Provider value={contextValue}>
      {children}
      {globalStatus.dirty ? <BeforeUnloadGuard /> : null}
      {renderPrompt({
        busy: promptBusy,
        discarding,
        onDiscard: () => void handleDiscard(),
        onStay: handleStay,
        open: promptOpen,
      })}
    </UnsavedChangesContext.Provider>
  );
}
