import React from "react";

export type UnsavedChangesScopeId = string | null | undefined;

export type UnsavedChangesRegistration = {
  busy: boolean;
  dirty: boolean;
  id: string;
  scopeId?: string;
};

export type UnsavedChangesStatus = {
  busy: boolean;
  dirty: boolean;
};

export type UnsavedChangesDiscardRequest = {
  onDiscard: () => void | Promise<void>;
  scopeId?: string | null;
};

export type UnsavedChangesContextValue = {
  removeRegistration: (id: string) => void;
  requestDiscard: (request: UnsavedChangesDiscardRequest) => void;
  runWithoutNavigationBlock: <T>(action: () => T) => T;
  upsertRegistration: (registration: UnsavedChangesRegistration) => void;
};

export type UnsavedChangesRegistry = {
  getSnapshot: () => ReadonlyMap<string, UnsavedChangesRegistration>;
  getStatus: (scopeId?: UnsavedChangesScopeId) => UnsavedChangesStatus;
  isNavigationBlockBypassed: () => boolean;
  removeRegistration: (id: string) => void;
  runWithoutNavigationBlock: <T>(action: () => T) => T;
  subscribe: (listener: () => void) => () => void;
  upsertRegistration: (registration: UnsavedChangesRegistration) => void;
};

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    "then" in value &&
    typeof value.then === "function"
  );
}

export function isUnsavedChangesRegistrationInScope(
  registration: UnsavedChangesRegistration,
  scopeId: UnsavedChangesScopeId,
): boolean {
  if (scopeId == null) {
    return true;
  }

  return registration.scopeId === scopeId || registration.scopeId?.startsWith(`${scopeId}/`) === true;
}

export function getUnsavedChangesStatus(
  registrations: ReadonlyMap<string, UnsavedChangesRegistration>,
  scopeId: UnsavedChangesScopeId,
): UnsavedChangesStatus {
  let dirty = false;
  let busy = false;

  for (const registration of registrations.values()) {
    if (!registration.dirty || !isUnsavedChangesRegistrationInScope(registration, scopeId)) {
      continue;
    }

    dirty = true;
    busy ||= registration.busy;
  }

  return { dirty, busy };
}

export function createUnsavedChangesRegistry(): UnsavedChangesRegistry {
  let registrations: ReadonlyMap<string, UnsavedChangesRegistration> = new Map();
  let navigationBypassDepth = 0;
  const listeners = new Set<() => void>();

  function commit(next: ReadonlyMap<string, UnsavedChangesRegistration>): void {
    if (next === registrations) {
      return;
    }

    registrations = next;
    listeners.forEach(listener => listener());
  }

  function releaseNavigationBypass(): void {
    navigationBypassDepth = Math.max(0, navigationBypassDepth - 1);
  }

  return {
    getSnapshot: () => registrations,
    getStatus: scopeId => getUnsavedChangesStatus(registrations, scopeId),
    isNavigationBlockBypassed: () => navigationBypassDepth > 0,
    removeRegistration: id => {
      if (!registrations.has(id)) {
        return;
      }

      const next = new Map(registrations);
      next.delete(id);
      commit(next);
    },
    runWithoutNavigationBlock: <T>(action: () => T): T => {
      navigationBypassDepth += 1;

      try {
        const result = action();

        if (isPromiseLike(result)) {
          return Promise.resolve(result).finally(releaseNavigationBypass) as T;
        }

        releaseNavigationBypass();
        return result;
      } catch (error) {
        releaseNavigationBypass();
        throw error;
      }
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    upsertRegistration: registration => {
      const previous = registrations.get(registration.id);

      if (
        previous &&
        previous.scopeId === registration.scopeId &&
        previous.dirty === registration.dirty &&
        previous.busy === registration.busy
      ) {
        return;
      }

      const next = new Map(registrations);
      next.set(registration.id, registration);
      commit(next);
    },
  };
}

const defaultValue: UnsavedChangesContextValue = {
  removeRegistration: () => undefined,
  requestDiscard: request => void request.onDiscard(),
  runWithoutNavigationBlock: action => action(),
  upsertRegistration: () => undefined,
};

export const UnsavedChangesContext = React.createContext<UnsavedChangesContextValue>(defaultValue);
export const UnsavedChangesScopeContext = React.createContext<string | undefined>(undefined);

export function useUnsavedChanges() {
  return React.useContext(UnsavedChangesContext);
}

export function useUnsavedChangesScopeId() {
  return React.useContext(UnsavedChangesScopeContext);
}
