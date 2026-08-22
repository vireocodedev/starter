import {
  UnsavedChangesContext,
  UnsavedChangesScopeContext,
  type UnsavedChangesContextValue,
} from "@/capabilities/unsaved-changes/contexts/UnsavedChangesContext/UnsavedChangesContext";
import {
  useUnsavedChangesRegistration,
  type UseUnsavedChangesRegistrationProps,
} from "./useUnsavedChangesRegistration";
import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

function createContextValue(): UnsavedChangesContextValue {
  return {
    removeRegistration: vi.fn(),
    requestDiscard: vi.fn(),
    runWithoutNavigationBlock: action => action(),
    upsertRegistration: vi.fn(),
  };
}

describe("useUnsavedChangesRegistration", () => {
  it("keeps one registration synchronized with its inherited scope and removes it on unmount", () => {
    const context = createContextValue();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UnsavedChangesContext.Provider value={context}>
        <UnsavedChangesScopeContext.Provider value="invoice">{children}</UnsavedChangesScopeContext.Provider>
      </UnsavedChangesContext.Provider>
    );
    const initialProps: UseUnsavedChangesRegistrationProps = { dirty: false };
    const { rerender, unmount } = renderHook(props => useUnsavedChangesRegistration(props), {
      initialProps,
      wrapper,
    });
    const id = vi.mocked(context.upsertRegistration).mock.calls[0][0].id;

    expect(context.upsertRegistration).toHaveBeenLastCalledWith({
      id,
      scopeId: "invoice",
      dirty: false,
      busy: false,
    });

    rerender({ dirty: true, busy: true });
    expect(context.upsertRegistration).toHaveBeenLastCalledWith({
      id,
      scopeId: "invoice",
      dirty: true,
      busy: true,
    });

    unmount();
    expect(context.removeRegistration).toHaveBeenLastCalledWith(id);
  });

  it("removes a disabled registration and honors an explicit scope", () => {
    const context = createContextValue();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UnsavedChangesContext.Provider value={context}>{children}</UnsavedChangesContext.Provider>
    );
    const { rerender } = renderHook(props => useUnsavedChangesRegistration(props), {
      initialProps: { dirty: true, scopeId: "settings" } as UseUnsavedChangesRegistrationProps,
      wrapper,
    });
    const id = vi.mocked(context.upsertRegistration).mock.calls[0][0].id;

    expect(context.upsertRegistration).toHaveBeenLastCalledWith({
      id,
      scopeId: "settings",
      dirty: true,
      busy: false,
    });

    rerender({ dirty: true, scopeId: "settings", enabled: false });
    expect(context.removeRegistration).toHaveBeenCalledWith(id);
  });
});
