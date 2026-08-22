import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useVireoTransitionPresence } from "./useVireoTransitionPresence";

describe("useVireoTransitionPresence", () => {
  it("renders an initial value as visible", () => {
    const { result } = renderHook(() => useVireoTransitionPresence("Account"));

    expect(result.current.visible).toBe(true);
    expect(result.current.renderedValue).toBe("Account");
  });

  it("treats false-like values as present", () => {
    const { result } = renderHook(() => useVireoTransitionPresence(0));

    expect(result.current.visible).toBe(true);
    expect(result.current.renderedValue).toBe(0);
  });

  it("retains a removed value until its exit completes", () => {
    const onExited = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: string | null }) => useVireoTransitionPresence(value, { onExited }),
      { initialProps: { value: "Account" as string | null } },
    );

    rerender({ value: null });
    expect(result.current.visible).toBe(false);
    expect(result.current.renderedValue).toBe("Account");

    act(() => result.current.completeExit());
    expect(result.current.renderedValue).toBeNull();
    expect(onExited).toHaveBeenCalledOnce();
  });

  it("updates a visible value without starting an exit", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string | null }) => useVireoTransitionPresence(value),
      {
        initialProps: { value: "Account A" as string | null },
      },
    );

    rerender({ value: "Account B" });
    expect(result.current.visible).toBe(true);
    expect(result.current.renderedValue).toBe("Account B");

    rerender({ value: null });
    expect(result.current.visible).toBe(false);
    expect(result.current.renderedValue).toBe("Account B");
  });

  it("accepts unstable non-null object values without creating a synchronization loop", () => {
    const { result, rerender } = renderHook(() => useVireoTransitionPresence({ id: "account" }));

    rerender();

    expect(result.current.visible).toBe(true);
    expect(result.current.renderedValue).toEqual({ id: "account" });
  });

  it("re-enters with a new value and ignores stale exit completion", () => {
    const onExited = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: string | null }) => useVireoTransitionPresence(value, { onExited }),
      { initialProps: { value: "Account A" as string | null } },
    );

    rerender({ value: null });
    const staleCompleteExit = result.current.completeExit;
    rerender({ value: "Account B" });
    act(() => staleCompleteExit());

    expect(result.current.visible).toBe(true);
    expect(result.current.renderedValue).toBe("Account B");
    expect(onExited).not.toHaveBeenCalled();
  });

  it("can re-enter the same value after the source transitions through null", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string | null }) => useVireoTransitionPresence(value),
      { initialProps: { value: "Account" as string | null } },
    );

    rerender({ value: null });
    act(() => result.current.completeExit());
    rerender({ value: "Account" });

    expect(result.current.visible).toBe(true);
    expect(result.current.renderedValue).toBe("Account");
  });

  it("dismisses idempotently and does not re-show an unchanged source value", () => {
    const onExited = vi.fn();
    const { result, rerender } = renderHook(() => useVireoTransitionPresence("Account", { onExited }));

    act(() => {
      result.current.dismiss();
      result.current.dismiss();
    });
    expect(result.current.visible).toBe(false);
    expect(result.current.renderedValue).toBe("Account");

    act(() => {
      result.current.completeExit();
      result.current.completeExit();
    });
    rerender();

    expect(result.current.renderedValue).toBeNull();
    expect(onExited).toHaveBeenCalledOnce();
  });

  it("uses the latest callback after making completion reentrant-safe", () => {
    const first = vi.fn();
    const completion = { current: undefined as (() => void) | undefined };
    const second = vi.fn(() => completion.current?.());
    const { result, rerender } = renderHook(({ onExited }) => useVireoTransitionPresence("Account", { onExited }), {
      initialProps: { onExited: first },
    });

    act(() => result.current.dismiss());
    rerender({ onExited: second });
    completion.current = result.current.completeExit;
    act(() => result.current.completeExit());

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    expect(result.current.renderedValue).toBeNull();
  });

  it("does not invoke onExited merely because its owner unmounts", () => {
    const onExited = vi.fn();
    const { result, unmount } = renderHook(() => useVireoTransitionPresence("Account", { onExited }));

    act(() => result.current.dismiss());
    unmount();

    expect(onExited).not.toHaveBeenCalled();
  });

  it("keeps methods stable and propagates callback errors after clearing state", () => {
    const failure = new Error("Exit observer failed");
    const { result, rerender } = renderHook(({ onExited }) => useVireoTransitionPresence("Account", { onExited }), {
      initialProps: { onExited: () => undefined },
    });
    const methods = { dismiss: result.current.dismiss, completeExit: result.current.completeExit };

    rerender({ onExited: () => undefined });
    expect(result.current.dismiss).toBe(methods.dismiss);
    expect(result.current.completeExit).toBe(methods.completeExit);

    act(() => result.current.dismiss());
    rerender({
      onExited: () => {
        throw failure;
      },
    });
    expect(() => act(() => result.current.completeExit())).toThrow(failure);
    rerender({ onExited: () => undefined });
    expect(result.current.renderedValue).toBeNull();
    expect(() => act(() => result.current.completeExit())).not.toThrow();
  });
});
