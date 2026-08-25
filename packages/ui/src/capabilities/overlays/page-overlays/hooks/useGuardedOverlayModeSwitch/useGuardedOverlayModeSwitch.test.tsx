import { useGuardedOverlayModeSwitch } from "./useGuardedOverlayModeSwitch";
import {
  UnsavedChangesContext,
  type UnsavedChangesContextValue,
  type UnsavedChangesDiscardRequest,
} from "@/capabilities/unsaved-changes/public";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

type TestModes = {
  form: { value: string };
  filters: { value: string };
};

function GuardedSwitchHarness({ onOpen }: { onOpen: (mode: keyof TestModes, payload: { value: string }) => void }) {
  const openMode = useGuardedOverlayModeSwitch<TestModes>(true, onOpen);

  return (
    <button type="button" onClick={() => openMode("filters", { value: "filters" })}>
      Open filters
    </button>
  );
}

function renderHarness({
  dirty,
  onOpen,
}: {
  dirty: boolean;
  onOpen: (mode: keyof TestModes, payload: { value: string }) => void;
}) {
  let pendingRequest: UnsavedChangesDiscardRequest | undefined;
  const context: UnsavedChangesContextValue = {
    removeRegistration: vi.fn(),
    requestDiscard: request => {
      if (dirty) pendingRequest = request;
      else void request.onDiscard();
    },
    runWithoutNavigationBlock: action => action(),
    upsertRegistration: vi.fn(),
  };

  render(
    <UnsavedChangesContext.Provider value={context}>
      <GuardedSwitchHarness onOpen={onOpen} />
    </UnsavedChangesContext.Provider>,
  );

  return { confirmDiscard: () => pendingRequest?.onDiscard() };
}

describe("useGuardedOverlayModeSwitch", () => {
  it("waits for discard confirmation before replacing dirty overlay content", async () => {
    const onOpen = vi.fn<(mode: keyof TestModes, payload: { value: string }) => void>();
    const { confirmDiscard } = renderHarness({ dirty: true, onOpen });

    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));
    expect(onOpen).not.toHaveBeenCalled();

    await act(async () => {
      await confirmDiscard();
    });
    expect(onOpen).toHaveBeenCalledWith("filters", { value: "filters" });
  });

  it("switches immediately when nothing is dirty", () => {
    const onOpen = vi.fn<(mode: keyof TestModes, payload: { value: string }) => void>();
    renderHarness({ dirty: false, onOpen });

    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));

    expect(onOpen).toHaveBeenCalledWith("filters", { value: "filters" });
  });

  it("keeps a stable callback while using the latest overlay state and opener", () => {
    const requestDiscard = vi.fn((request: UnsavedChangesDiscardRequest) => request.onDiscard());
    const context: UnsavedChangesContextValue = {
      removeRegistration: vi.fn(),
      requestDiscard,
      runWithoutNavigationBlock: action => action(),
      upsertRegistration: vi.fn(),
    };
    const wrapper = ({ children }: React.PropsWithChildren) => (
      <UnsavedChangesContext.Provider value={context}>{children}</UnsavedChangesContext.Provider>
    );
    const firstOnOpen = vi.fn<(mode: keyof TestModes, payload: { value: string }) => void>();
    const latestOnOpen = vi.fn<(mode: keyof TestModes, payload: { value: string }) => void>();
    const { result, rerender } = renderHook(
      ({ open, onOpen }) => useGuardedOverlayModeSwitch<TestModes>(open, onOpen),
      { initialProps: { open: false, onOpen: firstOnOpen }, wrapper },
    );
    const initialCallback = result.current;

    rerender({ open: true, onOpen: latestOnOpen });

    expect(result.current).toBe(initialCallback);
    act(() => result.current("filters", { value: "latest" }));
    expect(requestDiscard).toHaveBeenCalledOnce();
    expect(firstOnOpen).not.toHaveBeenCalled();
    expect(latestOnOpen).toHaveBeenCalledWith("filters", { value: "latest" });
  });
});
