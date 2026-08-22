import {
  UnsavedChangesContext,
  UnsavedChangesScopeContext,
  type UnsavedChangesContextValue,
} from "@/capabilities/unsaved-changes/contexts/UnsavedChangesContext/UnsavedChangesContext";
import {
  useUnsavedChangesRequestDiscard,
  type UseUnsavedChangesRequestDiscardOptions,
} from "./useUnsavedChangesRequestDiscard";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

function createWrapper(context: UnsavedChangesContextValue) {
  return ({ children }: { children: React.ReactNode }) => (
    <UnsavedChangesContext.Provider value={context}>
      <UnsavedChangesScopeContext.Provider value="invoice">{children}</UnsavedChangesScopeContext.Provider>
    </UnsavedChangesContext.Provider>
  );
}

describe("useUnsavedChangesRequestDiscard", () => {
  it("requests discard for the inherited scope", () => {
    const requestDiscard = vi.fn();
    const onDiscard = vi.fn();
    const context: UnsavedChangesContextValue = {
      removeRegistration: vi.fn(),
      requestDiscard,
      runWithoutNavigationBlock: action => action(),
      upsertRegistration: vi.fn(),
    };
    const { result } = renderHook(() => useUnsavedChangesRequestDiscard(onDiscard), {
      wrapper: createWrapper(context),
    });

    act(() => result.current());

    expect(requestDiscard).toHaveBeenCalledWith({ scopeId: "invoice", onDiscard });
  });

  it("honors explicit scope and disabled options", () => {
    const requestDiscard = vi.fn();
    const onDiscard = vi.fn();
    const context: UnsavedChangesContextValue = {
      removeRegistration: vi.fn(),
      requestDiscard,
      runWithoutNavigationBlock: action => action(),
      upsertRegistration: vi.fn(),
    };
    const initialProps: { options: UseUnsavedChangesRequestDiscardOptions } = { options: { scopeId: null } };
    const { result, rerender } = renderHook(
      ({ options }: { options: UseUnsavedChangesRequestDiscardOptions }) =>
        useUnsavedChangesRequestDiscard(onDiscard, options),
      {
        initialProps,
        wrapper: createWrapper(context),
      },
    );

    act(() => result.current());
    expect(requestDiscard).toHaveBeenLastCalledWith({ scopeId: null, onDiscard });

    rerender({ options: { disabled: true } });
    act(() => result.current());
    expect(requestDiscard).toHaveBeenCalledTimes(1);
  });
});
